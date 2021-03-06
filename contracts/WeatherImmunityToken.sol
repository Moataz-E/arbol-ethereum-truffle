pragma solidity 0.4.24;

import './SafeMath.sol';
import './DecoupledERC721Token.sol';
import './Arbolcoin.sol';
import './EternalDonut.sol';
import './Ownable.sol';
import './WITEvaluator.sol';
import './CallbackableWIT.sol';
import './IERC20.sol';

/**
 * @title Weather Immunity Token for ARBOL.
 *
 * @dev If you hold this token you are eligible for a payout based on the outcome of the weather.
 * @dev WITs are a representation of a protection agreement between two parties.
 * @dev Various terms can be set by the "proposer." The proposer receives their own WIT, and this WIT is referred to as the "proposal WIT."
 * @dev When the proposal WIT is created, the proposer deposits some ether into the smart contract.
 * @dev This ether is referred to as the "proposal ether" and represents the amount that the proposer wishes to bet. 
 *
 * @dev The proposal needs to be accepted before it does anything interesting. 
 * @dev If it is accepted, a new WIT is created according to the terms specified in the first one.
 * @dev The accepter also deposits some ether. Both parties' ether is now locked until the WITs are evaluated.
 *
 * @dev WITs can be transferred after they have been created. They are nonfungible ERC721 tokens.
 *
 */
contract WeatherImmunityToken is DecoupledERC721Token, Ownable, CallbackableWIT {
  using SafeMath for uint;

    struct WIT {
      uint WITID;           // Unique ID
      uint aboveEscrow;     // Amount of ether escrowed by the party betting on an "above threshold" outcome.
      uint belowEscrow;     // Amount of ether escrowed by the party betting on a "below threshold" outcome.
      uint aboveID;         // The address of the party betting on an "above threshold" outcome (the token holder).
      uint belowID;         // The address of the party betting on a "below threshold" outcome (the token holder).
      address evaluator;    // The address of the contract that shall provide the outcome (above or below threshold).
      uint thresholdPPTTH;  // The threshold in "parts per ten thousand." 9000 equals 10% below average, 11000 equals 10% above average
      string location;     // The geographic location or locations for which the weather outcome shall be relevant.
      uint start;           // Unix timestamp representing the start time of the relevant time period.
      uint end;             // Unix timestamp representing the end time of the relevant time period.
      bool makeStale;       // Whether or not to allow the proposal to be accepted after "start" is in the past. Defaults to "no."
      bool stakingStablecoin;
    }

    // Arbolcoin smart contract (contains address). 
    Arbolcoin private arbolcoin;

    // Stablecoin address. ERC20 compliant Gemini Dollar (GUSD) in production.
    IERC20 private stableERC20;

    // ARBOL fees go to this wallet. TODO make this owner, or implement revenue token.
    address private systemFeeWallet = 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE;

    // The ARBOL system fee in parts per million. (of wei.) 100% for now.
    uint public systemFeePPM;

    bool private testmode = true;

    event ProposalAccepted(uint indexed WITID, uint aboveID, uint belowID, address aboveOwner, address belowOwner, uint indexed weiContributing,  uint indexed weiAsking, address evaluator, uint thresholdPPTTH, string location, uint start, uint end, bool makeStale, bool stakingStablecoin);
    event ProposalOffered(uint indexed WITID, uint aboveID, uint belowID, address aboveOwner, address belowOwner, uint indexed weiContributing,  uint indexed weiAsking, address evaluator, uint thresholdPPTTH, string location, uint start, uint end, bool makeStale, bool stakingStablecoin);
    event WITEvaluated(uint indexed WITID, address indexed aboveOwner, address indexed belowOwner, address beneficiary, uint weiPayout, uint aboveID, uint belowID, bool stakingStablecoin);
    event WITCancelled(uint indexed WITID, address indexed owner, uint indexed amountRedeemed, bool stakingStablecoin);
    event ContractDecomissioned(uint numDependants, uint balance, address recepientOfEscrow);
    event WITEvaluationInvoked(uint indexed WITID, address indexed invoker, address indexed evaluator);
    event WeirdThingHappened(string thingThatHappened);


    /**
    * @dev Initialize the contract. Do this separately from the contstructor because of gas issues.
    * @param arbolAddress The address of the Arbolcoin contract.
    * @param storageAddress The address of the decoupled storage contract.
    * @param NOAAPrecipAggregate The address of a particular evaluator contract.
    */
    function initialize(address arbolAddress, address storageAddress, address NOAAPrecipAggregate, address NASA, address _stableERC20) public onlyContractOwner {
        arbolcoin = Arbolcoin(arbolAddress);
        storageContract = EternalDonut(storageAddress);
        require(storageContract.getUIntValue(keccak256("WITIDCounter")) == 0);
        systemFeePPM = 1000000;
        stableERC20 = IERC20(_stableERC20);
        storageContract.setUIntValue(keccak256("WITIDCounter"), uint(1)); //start at 1
        storageContract.setAddressValue(keccak256("Dependants", uint(1)), address(storageContract));
        storageContract.setAddressValue(keccak256("Dependants", uint(2)), address(NOAAPrecipAggregate));
        storageContract.setAddressValue(keccak256("Dependants", uint(3)), address(NASA));
        storageContract.setUIntValue(keccak256("DependantsCounter"), uint(3)); 
        testmode = true;
      }


event debug(string fe, uint asdf);
event debug2(string asdf, bool ef);

    /**
    * @dev Create a WIT without a partner. (A proposal.)
    * @param weiContributing Amount of wei user proposes to contribute
    * @param weiAsking Amount of wei user proposes the partner contribute.
    * @param aboveOrBelow Whether the user is betting on an above outcome (true) or a below outcome (false).
    * @param evaluator The address of the contract that will evaluate the WIT (for example one that integrates with a specific weather API).
    * @param thresholdPPTTH The threshold by which the payout will be determined.
    * @param location The geographic location or locations relevant to the weather outcome.
    * @param start The start date of the WIT.
    * @param end The end date of the WIT.
    * @param makeStale If set to true, the WIT will be taken off the open market after its start date passes. That is, no one will be able to accept it.
    */
    function createWITProposal(uint weiContributing, uint weiAsking, bool aboveOrBelow, address evaluator, uint thresholdPPTTH, string location, uint start, uint end, bool makeStale, bool stakingStablecoin) public payable {
        require(weiContributing > 0);
        require(weiAsking > 0);
        weiAsking.add(weiContributing); // this expression will throw if the escrow amounts are too big.

        /*
        Don't let people create WITs that start in the past. Could allow people to execute a sort of abuse
        where a hapless rube accidentally accepts a WIT that has already gone in favor of the proposer.

        But we do need to be able to create WITs in the past for testing purposes, so we allow it if "test
        mode" in on. Can't test evaluateWIT unless the term period of the WIT has already passed.
        */

        // on testnet, we let people create WITs in the past. Otherwise there's nothing to test!
        if (!testmode) { require(now < start); }
        require(start < end);
        if (!stakingStablecoin) { require(msg.value == weiContributing); }
        else { 
            require(stableERC20.allowance(msg.sender, address(this)) >= weiContributing); 
            require(stableERC20.transferFrom(msg.sender, address(this), weiContributing));
        }
        WIT memory new_WIT;
        if (aboveOrBelow) {
          new_WIT = WIT(getTokenCounter(), weiContributing, weiAsking, getTokenCounter(), 0, evaluator, thresholdPPTTH, location, start, end, makeStale, stakingStablecoin);
          emit ProposalOffered(getTokenCounter(), getTokenCounter(), 0, msg.sender, address(0), weiContributing, weiAsking, evaluator, thresholdPPTTH, location, start, end, makeStale, stakingStablecoin);
        }
        else {
          new_WIT = WIT(getTokenCounter(), weiAsking, weiContributing, 0, getTokenCounter(), evaluator, thresholdPPTTH, location, start, end, makeStale, stakingStablecoin);
          emit ProposalOffered(getTokenCounter(), 0, getTokenCounter(), address(0), msg.sender, weiContributing, weiAsking, evaluator, thresholdPPTTH, location, start, end, makeStale, stakingStablecoin);
        }
        saveWIT(new_WIT);
        _mint(msg.sender, getTokenCounter());
        incrementTokenCounter();

    }


    /**
    * @dev Create a WIT and partner it to an existing WIT (accept a proposed protection agreement).
    * @param proposalID The ID of the WIT to which the new WIT shall be partnered.
    */
    function createWITAcceptance(uint proposalID) public payable {
        require(ownerOf(proposalID) != address(0));
        WIT memory proposalWIT = getWIT(proposalID);
        if (proposalWIT.makeStale) { require(now < proposalWIT.start); }
        
        // Figure out whether we are adding an "above" or "below" WIT.
        uint expectedEscrow;
        if (proposalWIT.aboveID == 0) { 
            expectedEscrow = proposalWIT.aboveEscrow; 
            storageContract.setUIntValue(keccak256("WIT", proposalWIT.WITID, "aboveID"), proposalWIT.WITID.add(1));
            emit ProposalAccepted(proposalWIT.WITID, proposalWIT.WITID.add(1), proposalWIT.WITID, msg.sender, ownerOf(proposalWIT.belowID), msg.value, proposalWIT.belowEscrow, proposalWIT.evaluator, proposalWIT.thresholdPPTTH, proposalWIT.location, proposalWIT.start, proposalWIT.end, proposalWIT.makeStale, proposalWIT.stakingStablecoin);
        }
        else { 
            if (proposalWIT.belowID == 0) {
                expectedEscrow = proposalWIT.belowEscrow;
                storageContract.setUIntValue(keccak256("WIT", proposalWIT.WITID, "belowID"), proposalWIT.WITID.add(1));
                emit ProposalAccepted(proposalWIT.WITID, proposalWIT.WITID, proposalWIT.WITID.add(1), ownerOf(proposalWIT.aboveID), msg.sender, proposalWIT.aboveEscrow, msg.value, proposalWIT.evaluator, proposalWIT.thresholdPPTTH, proposalWIT.location, proposalWIT.start, proposalWIT.end, proposalWIT.makeStale, proposalWIT.stakingStablecoin);
            }
            else {
                emit WeirdThingHappened("Someone is trying to accept a really weird WIT.");
                return;
            }
        }
        if (proposalWIT.stakingStablecoin) {
            require(stableERC20.allowance(msg.sender, address(this)) == expectedEscrow);
            require(stableERC20.transferFrom(msg.sender, address(this), expectedEscrow));
        }
        else {
            require(msg.value == expectedEscrow); 
        }
        _mint(msg.sender, proposalWIT.WITID.add(1));
    }


    /**
    * @dev Determine the outcome of the weather for a WIT by invoking the Evaluator contract's evaluateWIT function.
    * @param tokenID The WIT to be evaluated
    * @param runtimeParams any additional parameters that are required at evaluation runtime.
    */
   function evaluate(uint tokenID, string runtimeParams) public payable {
        WIT memory the_wit = getWIT(tokenID);
        require(the_wit.end < now);
        require(the_wit.aboveID != 0);
        require(the_wit.belowID != 0);
        WITEvaluator evaluator = WITEvaluator(the_wit.evaluator); 
        evaluator.evaluateWIT.value(msg.value)(tokenID, the_wit.start, the_wit.end, the_wit.thresholdPPTTH, the_wit.location, 10, "");
        emit WITEvaluationInvoked(the_wit.WITID, msg.sender, the_wit.evaluator); 
    }


    /**
    * @dev Callback function to be invoked by the evaluator contract upon completion of the evaluation.
    * @dev This function pays out the ether that has been escrowed to the appropriate WIT holder.
    * @param WITID The ID of the WIT that has been evaluated.
    * @param outcome The result of the evaluation. ("above" or "below.")
    */
    function evaluatorCallback(uint WITID, string outcome) public {
        WIT memory the_wit = getWIT(WITID);
        require(msg.sender == the_wit.evaluator);
        uint totalEscrow = the_wit.aboveEscrow.add(the_wit.belowEscrow);
        address beneficiary;
        if (keccak256(outcome) == keccak256("above")) { // use keccak because == doesn't work for strings.
            beneficiary = ownerOf(the_wit.aboveID);
        }
        else {
            if (keccak256(outcome) == keccak256("below")) {
                beneficiary = ownerOf(the_wit.belowID);
            }
            else { 
                emit WeirdThingHappened("Got an unexpected evaluation outcome of...");
                emit WeirdThingHappened(outcome); 
                return;
            }
        }
        emit WITEvaluated(WITID, ownerOf(the_wit.aboveID), ownerOf(the_wit.belowID), beneficiary, totalEscrow, the_wit.aboveID, the_wit.belowID, the_wit.stakingStablecoin);
        burnWIT(WITID);
        if (the_wit.stakingStablecoin) {
            require(stableERC20.transfer(beneficiary, totalEscrow));
        }
        else {
            beneficiary.transfer(totalEscrow); 
        }
    }



    /**
    * @dev Cancel an unpartnered WIT that you have created. Redeem the ETH escrowed therein.
    * @param tokenID The ID of your token that you want to cancel.
    */ 
    function cancelAndRedeem(uint tokenID) public {
        WIT memory the_wit = getWIT(tokenID);
        bool is_above_owner = ownerOf(the_wit.aboveID) == msg.sender;
        bool is_below_owner = ownerOf(the_wit.belowID) == msg.sender;
        require(is_above_owner || is_below_owner);                   // sender must own half of the WIT
        require((the_wit.aboveID == 0) || (the_wit.belowID == 0));   // also, the other half of the WIT must not be owned.
        burnWIT(tokenID);
        uint redemptionAmount;
        if (is_above_owner) { redemptionAmount = the_wit.aboveEscrow; }
        else { redemptionAmount = the_wit.belowEscrow; }
        if (the_wit.stakingStablecoin) {
            stableERC20.transfer(msg.sender, redemptionAmount);
        }
        else {
            msg.sender.transfer(redemptionAmount);
        }
        emit WITCancelled(tokenID, msg.sender, redemptionAmount, the_wit.stakingStablecoin);
    }    


    /**
    * @dev Retrieves a certain WIT from decoupled storage. Returns the WIT inside a WIT struct.
    * @param tokenID The ID of the desired WIT.
    */
    function getWIT(uint tokenID) private view returns (WIT) {
        uint aboveEscrow = storageContract.getUIntValue(keccak256("WIT", tokenID, "aboveEscrow"));
        uint belowEscrow = storageContract.getUIntValue(keccak256("WIT", tokenID, "belowEscrow"));
        uint aboveID = storageContract.getUIntValue(keccak256("WIT", tokenID, "aboveID"));
        uint belowID = storageContract.getUIntValue(keccak256("WIT", tokenID, "belowID"));    
        address evaluator = storageContract.getAddressValue(keccak256("WIT", tokenID, "evaluator"));
        uint thresholdPPTTH = storageContract.getUIntValue(keccak256("WIT", tokenID, "thresholdPPTTH"));
        string memory location = storageContract.getStringValue(keccak256("WIT", tokenID, "location"));
        uint start = storageContract.getUIntValue(keccak256("WIT", tokenID, "start"));
        uint end = storageContract.getUIntValue(keccak256("WIT", tokenID, "end"));
        bool makeStale = storageContract.getBooleanValue(keccak256("WIT", tokenID, "makeStale"));
        bool stakingStablecoin = storageContract.getBooleanValue(keccak256("WIT", tokenID, "stakingStablecoin"));
        return WIT(tokenID, aboveEscrow, belowEscrow, aboveID, belowID, evaluator, thresholdPPTTH, location, start, end, makeStale, stakingStablecoin);        
    }


    /**
    * @dev Saves a WIT to the decoupled storage contract.
    * @param the_wit The WIT to be saved.
    */
    function saveWIT(WIT the_wit) private {
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "aboveEscrow"), the_wit.aboveEscrow);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "belowEscrow"), the_wit.belowEscrow);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "aboveID"), the_wit.aboveID);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "belowID"), the_wit.belowID);        
        storageContract.setAddressValue(keccak256("WIT", the_wit.WITID, "evaluator"), the_wit.evaluator);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "thresholdPPTTH"), the_wit.thresholdPPTTH);
        storageContract.setStringValue(keccak256("WIT", the_wit.WITID, "location"), the_wit.location);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "start"), the_wit.start);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "end"), the_wit.end);
        storageContract.setBooleanValue(keccak256("WIT", the_wit.WITID, "makeStale"), the_wit.makeStale);
        storageContract.setBooleanValue(keccak256("WIT", the_wit.WITID, "stakingStablecoin"), the_wit.stakingStablecoin);
    }


    /**
    * @dev Burns a specific token.  
    * @param tokenID uint ID of the token being burned by the msg.sender
    */
    function burnWIT(uint tokenID) private { // gets called in cancelAndRedeem and evaluate
        WIT memory the_wit = getWIT(tokenID);
        address belowOwner = ownerOf(the_wit.belowID);
        _burn(belowOwner, the_wit.belowID);
        address aboveOwner = ownerOf(the_wit.aboveID);
        _burn(aboveOwner, the_wit.aboveID);
        saveWIT(WIT(tokenID, 0, 0, 0, 0, 0, 0, "", 0, 0, false, false));
    }


    /**
    * @dev Get the ID for the next token to be created.
    */
    function getTokenCounter() private view returns (uint) {
       return storageContract.getUIntValue(keccak256("WITIDCounter"));
    }


    /**
    * @dev Increment the counter for new WIT IDs. We increment by 2 because each WIT has
    * @dev two ERC721's associated with it, and both of those ERC721's will have unique IDs.
    * @dev The first will have the same ID as the WIT, and the second will have the ID of the WIT + 1.
    */
    function incrementTokenCounter() private {
        storageContract.setUIntValue(keccak256("WITIDCounter"), getTokenCounter().add(2)); // Yes, 2.
    }


    /**
    * @dev Add a contract to be owned by this contract.
    * @param dependant Address of the contract. 
    */
 //   function addDependant(address dependant) public onlyContractOwner {
   //     uint counter = storageContract.getUIntValue(keccak256("DependantsCounter"));
     //   storageContract.setAddressValue(keccak256("Dependants", counter.add(1)), dependant);
       // storageContract.setUIntValue(keccak256("DependantsCounter"), counter.add(1));
  //  }


    /**
    * @dev Shut down this contract.
    * @dev Transfer all owned contracts and transfer all ether.
    */
//    function decomission(address newOwner) onlyContractOwner public {
  //      uint numDependants = storageContract.getUIntValue(keccak256("DependantsCounter")); 
    //    for (uint counter = numDependants; counter > 0; counter--) {
      //      address dependant = storageContract.getAddressValue(keccak256("Dependants", counter));
        //    Ownable(dependant).transferOwnership(newOwner);
 //       }
   //     emit ContractDecomissioned(numDependants, address(this).balance, the_owner);
     //   the_owner.transfer(address(this).balance);
        //TODO get ether out of NOAAPrecipAggregate contract
   // }

}