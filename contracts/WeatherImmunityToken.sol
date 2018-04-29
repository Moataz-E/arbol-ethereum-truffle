pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './DecoupledERC721Token.sol';
import './Arbolcoin.sol';
import './EternalDonut.sol';
import './Ownable.sol';
import './WITEvaluator.sol';
import './callbackableWIT.sol';

/**
 * @title Weather Immunity Token for ARBOL.
 *
 * @dev If you hold this token you are eligible for a payout based on the outcome of the weather.
 * @dev WITs are a representation of a protection agreement between two parties.
 * @dev Various terms can be set by the "proposer." The proposal is represented as one WIT.
 * @dev When the proposal WIT is created, the proposer deposits some ether into the smart contract. 
 *
 * @dev The proposal can be accepted. If it is accepted, a new WIT is created according to the terms specified in the first one.
 * @dev The accepter also deposits some ether. Both parties' ether is now locked until the WITs are evaluated.
 *
 * @dev WITs can be transferred after they have been created. They are nonfungible ERC721 tokens.
 *
 * @dev 
 */
contract WeatherImmunityToken is DecoupledERC721Token, Ownable, CallbackableWIT {
  using SafeMath for uint;

    struct WIT {
      uint WITID;
      uint aboveEscrow;
      uint belowEscrow;
      uint aboveID;
      uint belowID; 
      address evaluator;
      uint thresholdPPM;
      bytes32 location;
      uint start;
      uint end;
      bool makeStale;
      bool awaitingEvaluation;  //TODO get rid of this as oraclize callbacks can be executed before the query sometimes.
    }

    // Arbolcoin smart contract (contains address). 
    Arbolcoin private arbol;

    // ARBOL fees go to this wallet. TODO make this owner, or implement revenue token.
    address private systemFeeWallet = 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE;


    // The ARBOL system fee in parts per million. (of wei.) 100% for now.
    uint public systemFeePPM;

    // These are to facilitate queries related to getting open proposals.
    event Redemption(uint indexed WITID, uint amount, address indexed user);
    event ProposalAccepted(uint indexed WITID, uint indexed aboveID, uint indexed belowID);
    event ProposalOffered(uint indexed WITID, uint aboveID, uint belowID, uint indexed weiContributing,  uint indexed weiAsking, address evaluator, uint thresholdPPM, bytes32 location, uint start, uint end, bool makeStale);


    //do this separately from constructor because of gas issues
    function initialize(address _arbolAddress, address storageAddress, address NOAAPrecipAggregate) public onlyContractOwner {
      arbol = Arbolcoin(_arbolAddress);
      storageContract = EternalDonut(storageAddress);

      require(storageContract.getUIntValue(keccak256("WITIDCounter")) == 0);
      systemFeePPM = 1000000;
      storageContract.setUIntValue(keccak256("WITIDCounter"), uint(1)); //start at 1
      storageContract.setAddressValue(keccak256("Dependants", uint(1)), address(storageContract));
      storageContract.setAddressValue(keccak256("Dependants", uint(2)), address(NOAAPrecipAggregate));
      storageContract.setUIntValue(keccak256("DependantsCounter"), uint(2)); 
    }


  /**
  * @dev Guarantees msg.sender is owner of the given token
  * @param _tokenId uint256 ID of the token to validate its ownership belongs to msg.sender
  */
  modifier onlyOwnerOfSubWITOf(uint256 _tokenId) {
    WIT memory the_wit = getWIT(_tokenId);
    bool is_above_owner = ownerOf(the_wit.aboveID) == msg.sender;
    bool is_below_owner = ownerOf(the_wit.belowID) == msg.sender;
    require(is_above_owner || is_below_owner);
    _;
  }


   function getTokenCounter() private view returns (uint) {
    return storageContract.getUIntValue(keccak256("WITIDCounter"));
   }

   function incrementTokenCounter() private {
     storageContract.setUIntValue(keccak256("WITIDCounter"), getTokenCounter().add(2)); // Yes, 2.
   }

    function getWIT(uint tokenID) private returns (WIT) {
    uint aboveEscrow = storageContract.getUIntValue(keccak256("WIT", tokenID, "aboveEscrow"));
    uint belowEscrow = storageContract.getUIntValue(keccak256("WIT", tokenID, "belowEscrow"));
    uint aboveID = storageContract.getUIntValue(keccak256("WIT", tokenID, "aboveID"));
    uint belowID = storageContract.getUIntValue(keccak256("WIT", tokenID, "belowID"));    
    address evaluator = storageContract.getAddressValue(keccak256("WIT", tokenID, "evaluator"));
    uint thresholdPPM = storageContract.getUIntValue(keccak256("WIT", tokenID, "thresholdPPM"));
    bytes32 location = storageContract.getBytes32Value(keccak256("WIT", tokenID, "location"));
    uint start = storageContract.getUIntValue(keccak256("WIT", tokenID, "start"));
    uint end = storageContract.getUIntValue(keccak256("WIT", tokenID, "end"));
    bool makeStale = storageContract.getBooleanValue(keccak256("WIT", tokenID, "makeStale"));
    bool awaitingEvaluation = storageContract.getBooleanValue(keccak256("WIT", tokenID, "awaitingEvaluation"));
    return WIT(tokenID, aboveEscrow, belowEscrow, aboveID, belowID, evaluator, thresholdPPM, location, start, end, makeStale, awaitingEvaluation);
        
    }


    function saveWIT(WIT the_wit) private {
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "aboveEscrow"), the_wit.aboveEscrow);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "belowEscrow"), the_wit.belowEscrow);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "aboveID"), the_wit.aboveID);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "belowID"), the_wit.belowID);        
        storageContract.setAddressValue(keccak256("WIT", the_wit.WITID, "evaluator"), the_wit.evaluator);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "thresholdPPM"), the_wit.thresholdPPM);
        storageContract.setBytes32Value(keccak256("WIT", the_wit.WITID, "location"), the_wit.location);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "start"), the_wit.start);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "end"), the_wit.end);
        storageContract.setBooleanValue(keccak256("WIT", the_wit.WITID, "makeStale"), the_wit.makeStale);
        storageContract.setBooleanValue(keccak256("WIT", the_wit.WITID, "awaitingEvaluation"), the_wit.awaitingEvaluation);
    }



   /**
    * @dev Create a WIT without a partner. (A proposal.)
    * @param weiContributing Amount of wei user proposes to contribute
    * @param weiAsking Amount of wei user proposes the partner contribute.
    * @param evaluator The address of the contract that will evaluate the WIT (for example one that integrates with a specific weather API).
    * @param thresholdPPM The threshold by which the payout will be determined.
    * @param start The start date of the WIT.
    * @param end The end date of the WIT.
    * @param makeStale If set to true, the WIT will be taken off the open market after its start date passes. That is, no one will be able to accept it.
    */
    function createWITProposal(uint weiContributing, uint weiAsking, bool aboveOrBelow, address evaluator, uint thresholdPPM, bytes32 location, uint start, uint end, bool makeStale) public payable {


      require(weiContributing > 0);
      require(weiAsking > 0);
      weiAsking.add(weiContributing); // this expression will throw if the escrow amounts are too big.

      /*
      Don't let people create WITs that start in the past. Could allow people to execute a sort of abuse
      where a hapless rube accidentally accepts a WIT that has already gone in favor of the proposer.

      But we do need to be able to create WITs in the past for testing purposes, so we allow it for the
      contract owner. Can't test evaluateWIT unless the term period of the WIT has already passed.
      */
      if (msg.sender != owner) { require(now < start); }
      require(start < end);
  
      // Validate amount of wei sent.
      require(msg.value == weiContributing);

      // Calculate and take ARBOL fee.
    /*  uint fee = calculateFee(weiContributing, weiAsking);

      if (fee != 0) {
          require(arbol.transferFrom(msg.sender, systemFeeWallet, fee));
          //TODO accept ether
      }*/

      uint ID = getTokenCounter();

      _mint(msg.sender, ID);

      WIT memory new_WIT;
      if (aboveOrBelow) {
        new_WIT = WIT(ID, weiContributing, weiAsking, ID, 0, evaluator, thresholdPPM, location, start, end, makeStale, false);
        ProposalOffered(ID, ID, 0, weiContributing, weiAsking, evaluator, thresholdPPM, location, start, end, makeStale);
      }
      else {
        new_WIT = WIT(ID, weiAsking, weiContributing, 0, ID, evaluator, thresholdPPM, location, start, end, makeStale, false);
        ProposalOffered(ID, 0, ID, weiContributing, weiAsking, evaluator, thresholdPPM, location, start, end, makeStale);        
      }

      saveWIT(new_WIT);
      incrementTokenCounter();
    }

    event debug(address, uint);

    /**
    * @dev Create a WIT and partner it to an existing WIT (accept a proposed protection agreement).
    * @param proposalID The ID of the WIT to which the new WIT shall be partnered.
    */
    function createWITAcceptance(uint proposalID) public payable {

      // Specified partner token must exist
     require(ownerOf(proposalID) != address(0));
  
      WIT memory proposalWIT = getWIT(proposalID);

      uint new_ID = proposalWIT.WITID.add(1);
      uint fee;

      if (proposalWIT.makeStale) {
        require(now < proposalWIT.start);
      }

      // Figure out whether we are adding an "above" or "below" WIT receipt.
      if (proposalWIT.aboveID == 0) {
        // Validate the amount of wei sent.
        require(msg.value == proposalWIT.aboveEscrow);

 /*       fee = calculateFee(proposalWIT.aboveEscrow, proposalWIT.belowEscrow);
        if (fee != 0) {

        // TODO accept fee in ether
        require(arbol.transferFrom(msg.sender, systemFeeWallet, fee));
        }*/
        storageContract.setUIntValue(keccak256("WIT", proposalWIT.WITID, "aboveID"), new_ID);        
        ProposalAccepted(proposalWIT.WITID, new_ID, proposalWIT.WITID);

      }
      else {
        require(proposalWIT.belowID == 0);

        // Validate the amount of wei sent.
        require(msg.value == proposalWIT.belowEscrow);
  /*
        fee = calculateFee(proposalWIT.belowEscrow, proposalWIT.aboveEscrow);
        if (fee != 0) {

          // TODO accept fee in ether
          require(arbol.transferFrom(msg.sender, systemFeeWallet, fee));


        }*/
        storageContract.setUIntValue(keccak256("WIT", proposalWIT.WITID, "belowID"), new_ID);     
        ProposalAccepted(proposalWIT.WITID, proposalWIT.WITID, new_ID);


      }  

      _mint(msg.sender, new_ID);
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

     // saveWIT(WIT(tokenID, 0, 0, 0, 0, 0, 0, 0, 0, 0, false, false)); //TODO why doesnt this work? gas?
    }


    /**
    * @dev Calculates the fee in ARBOL associated with a WIT. Fees are paid by the seller, and are a percentage of the total escrowed ETH amount.
    * @param weiContributing One half of the total escrowed ETH in a partnered WIT pair (an agreement).
    * @param weiAsking The other half of the total escrowed ETH.
    * @return the fee in ARBOL
    */
    function calculateFee(uint weiContributing, uint weiAsking) public constant returns (uint) {
      uint totalEscrow = weiContributing.add(weiAsking);

      if (weiContributing >= weiAsking) {         // If user is contributing more than asking, they are the seller and they pay the fee.
        return totalEscrow.mul(systemFeePPM).div(1000000);
      } else if (weiContributing < weiAsking) {
        return 0; // Buyer role pays no fee
      } else {
            revert();
       }
    }


    /**
    * @dev Set the system fee to a new value. This doesn't affect existing WITs.
    */ 
    function setSystemFee(uint fee) public 
    onlyContractOwner {
      require(0 <= fee);
      systemFeePPM = fee;
    }


    /**
    * @dev Cancel an unpartnered WIT that you have created. Redeem the ETH escrowed therein.
    * @param tokenID The ID of your token that you want to cancel.
    TODO ARBOL redemption
    */ 
    function cancelAndRedeem(uint tokenID) onlyOwnerOfSubWITOf(tokenID) public {
      WIT memory the_wit = getWIT(tokenID);
      uint redemptionAmount = the_wit.belowEscrow;
      require((the_wit.aboveID == 0) || (the_wit.belowID == 0)); 
      burnWIT(tokenID);
      msg.sender.transfer(redemptionAmount);
      Redemption(tokenID, redemptionAmount, msg.sender);
      
    }

    event WITEvaluated(uint WITID, string evaluationResult, uint weiPayout);



    function evaluate(uint tokenID, string runtimeParams) onlyOwnerOfSubWITOf(tokenID) public {
      WIT memory the_wit = getWIT(tokenID);
      require(the_wit.end < now);
      require(the_wit.aboveID != 0);
      require(the_wit.belowID != 0);

      WITEvaluator evaluator = WITEvaluator(the_wit.evaluator);
      evaluator.evaluateWIT.value(msg.value)(tokenID, the_wit.start, the_wit.end, the_wit.thresholdPPM, the_wit.location, 10, "");
    //  storageContract.setBooleanValue(keccak256("WIT", the_wit.WITID, "awaitingEvaluation"), true);
  
    }


    function asdf(){
      revert();
    }

    event debug(uint, uint);
    
    event debug(string);
    function evaluatorCallback(uint WITID, string outcome) public {
        WIT memory the_wit = getWIT(WITID);
    //    require(msg.sender == the_wit.evaluator);

        uint totalEscrow = the_wit.aboveEscrow.add(the_wit.belowEscrow);
        address owner;
        if (keccak256(outcome) == keccak256("above")) { // use keccak because == doesn't work for strings.
            owner = ownerOf(the_wit.aboveID);
        }
        else {
            if (keccak256(outcome) == keccak256("below")) {
                owner = ownerOf(the_wit.belowID);
            }
            else {debug("Definitely shouldnt be here.");}
        }

        burnWIT(WITID);
        Redemption(WITID, totalEscrow, owner);
        debug(address(this).balance, totalEscrow);
     //   owner.transfer(totalEscrow); Why isnt this working?
        WITEvaluated(WITID, outcome, totalEscrow);
      }


  function addDependant(address dependant) public onlyContractOwner {
    uint counter = storageContract.getUIntValue(keccak256("DependantsCounter"));
    storageContract.setAddressValue(keccak256("Dependants", counter.add(1)), dependant);
    storageContract.setUIntValue(keccak256("DependantsCounter"), counter.add(1));
  }


  function transferOwnershipOfDependants(address newOwner) onlyContractOwner public {
    for (uint counter = storageContract.getUIntValue(keccak256("DependantsCounter")); counter > 0; counter--) {
      address dependant = storageContract.getAddressValue(keccak256("Dependants", counter));
      Ownable(dependant).transferOwnership(newOwner);
    }
  }


}