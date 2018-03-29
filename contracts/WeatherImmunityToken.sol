pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './DecoupledERC721Token.sol';
import './Arbolcoin.sol';
import './EternalDonut.sol';
import './WITEvaluator.sol';

/**
 * @title Weather Immunity Token for ARBOL and weather protection agreements.
 *
 * @dev If you hold this token you are eligible for a payout based on the outcome of the weather.
 * @dev WITs are a representation of a protection agreement between two parties.
 * @dev Various terms can be set by the "proposer." The proposal is represented as one WIT.
 * @dev The proposal can be accepted. If it is accepted, a new WIT is created according to the terms specified in the first one.
 * @dev WITs can be transferred after they have been created. They are nonfungible ERC721 tokens.
 */
contract WeatherImmunityToken is Ownable, DecoupledERC721Token {
  using SafeMath for uint;

    // A struct which represents all the values in a WIT.
    struct WIT {
      uint WITID;
      uint aboveEscrow;
      uint belowEscrow;
      uint aboveID;
      uint belowID; 
      address evaluator;
      bytes32 threshold;
      bytes32 location;
      uint start;
      uint end;
      bool makeStale;
    }

    // Arbolcoin smart contract (contains address). 
    Arbolcoin private arbol;

    // ARBOL fees go to this wallet. TODO make this owner, or implement revenue token.
    address private systemFeeWallet = 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE;

    EternalDonut private storageContract;

    // The ARBOL system fee in parts per million. (of wei.) 100% for now.
    uint public systemFeePPM;

    // These are to facilitate queries related to getting open proposals.
    event Redemption(uint indexed WITID, uint amount, address indexed user);
    event ProposalAccepted(uint indexed WITID, uint indexed aboveID, uint indexed belowID);
    event ProposalOffered(uint indexed WITID, uint aboveID, uint belowID, uint indexed weiContributing,  uint indexed weiAsking, address evaluator, string threshold, string location, uint start, uint end, bool makeStale);


   /**
    * @dev Constructor which sets the Arbolcoin address.
    * @param _arbolAddress The address of the Arbolcoin contract.
   */    
    function WeatherImmunityToken(address _arbolAddress, address storageAddress) DecoupledERC721Token(storageAddress) public {

      arbol = Arbolcoin(_arbolAddress);
      storageContract = EternalDonut(storageAddress);
      systemFeePPM = 1000000;


      storageContract.setUIntValue(keccak256("WITIDCounter"), 1); //start at 1
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
    bytes32 threshold = storageContract.getBytes32Value(keccak256("WIT", tokenID, "threshold"));
    bytes32 location = storageContract.getBytes32Value(keccak256("WIT", tokenID, "location"));
    uint start = storageContract.getUIntValue(keccak256("WIT", tokenID, "start"));
    uint end = storageContract.getUIntValue(keccak256("WIT", tokenID, "end"));
    bool makeStale = storageContract.getBooleanValue(keccak256("WIT", tokenID, "makeStale"));
    return WIT(tokenID, aboveEscrow, belowEscrow, aboveID, belowID, evaluator, threshold, location, start, end, makeStale);
        
    }

    function saveWIT(WIT the_wit) private {
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "aboveEscrow"), the_wit.aboveEscrow);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "belowEscrow"), the_wit.belowEscrow);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "aboveID"), the_wit.aboveID);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "belowID"), the_wit.belowID);        
        storageContract.setAddressValue(keccak256("WIT", the_wit.WITID, "evaluator"), the_wit.evaluator);
        storageContract.setBytes32Value(keccak256("WIT", the_wit.WITID, "threshold"), the_wit.threshold);
        storageContract.setBytes32Value(keccak256("WIT", the_wit.WITID, "location"), the_wit.location);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "start"), the_wit.start);
        storageContract.setUIntValue(keccak256("WIT", the_wit.WITID, "end"), the_wit.end);
        storageContract.setBooleanValue(keccak256("WIT", the_wit.WITID, "makeStale"), the_wit.makeStale);
    }

   /**
    * @dev Create a WIT without a partner. (A proposal.)
    * @param weiContributing Amount of wei user proposes to contribute
    * @param weiAsking Amount of wei user proposes the partner contribute.
    * @param evaluator The address of the contract that will evaluate the WIT (for example one that integrates with a specific weather API).
    * @param threshold The threshold by which the payout will be determined.
    * @param start The start date of the WIT.
    * @param end The end date of the WIT.
    * @param makeStale If set to true, the WIT will be taken off the open market after its start date passes. That is, no one will be able to accept it.
    */
    function createWITProposal(uint weiContributing, uint weiAsking, bool aboveOrBelow, address evaluator, string threshold, string location, uint start, uint end, bool makeStale) public payable {

      require(weiContributing > 0);
      require(weiAsking > 0);
      weiAsking.add(weiContributing); // this expression will throw if the escrow amounts are too big.

      require(now < start); // Don't let people create WITs that start in the past. Opens the door for abuse.
      require(start < end);
  
      // Validate amount of wei sent.
      require(msg.value == weiContributing);

      // Calculate and take ARBOL fee.
      uint fee = calculateFee(weiContributing, weiAsking);

      if (fee != 0) {
          require(arbol.transferFrom(msg.sender, systemFeeWallet, fee));
          //TODO accept ether
      }

      uint ID = getTokenCounter();

      _mint(msg.sender, ID);

      WIT memory new_WIT;
      if (aboveOrBelow) {
        new_WIT = WIT(ID, weiContributing, weiAsking, ID, 0, evaluator, keccak256(threshold), keccak256(location), start, end, makeStale);
        ProposalOffered(ID, ID, 0, weiContributing, weiAsking, evaluator, threshold, location, start, end, makeStale);
      }
      else {
        new_WIT = WIT(ID, weiAsking, weiContributing, 0, ID, evaluator, keccak256(threshold), keccak256(location), start, end, makeStale);
        ProposalOffered(ID, 0, ID, weiContributing, weiAsking, evaluator, threshold, location, start, end, makeStale);        
      }

      saveWIT(new_WIT);
      incrementTokenCounter();
    }


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

        fee = calculateFee(proposalWIT.aboveEscrow, proposalWIT.belowEscrow);
        if (fee != 0) {

        // TODO accept fee in ether
        require(arbol.transferFrom(msg.sender, systemFeeWallet, fee));
        }
        storageContract.setUIntValue(keccak256("WIT", proposalWIT.WITID, "aboveID"), new_ID);        
        ProposalAccepted(proposalWIT.WITID, new_ID, proposalWIT.WITID);

      }
      else {
        require(proposalWIT.belowID == 0);

        // Validate the amount of wei sent.
        require(msg.value == proposalWIT.belowEscrow);
  
        fee = calculateFee(proposalWIT.belowEscrow, proposalWIT.aboveEscrow);
        if (fee != 0) {

          // TODO accept fee in ether
          require(arbol.transferFrom(msg.sender, systemFeeWallet, fee));


        }
        storageContract.setUIntValue(keccak256("WIT", proposalWIT.WITID, "belowID"), new_ID);     
        ProposalAccepted(proposalWIT.WITID, proposalWIT.WITID, new_ID);


      }

      _mint(msg.sender, new_ID);

    }

    /**
    * @dev Burns a specific token.  
    * @param tokenID uint ID of the token being burned by the msg.sender
    */
    function burnWIT(uint tokenID) private onlyOwnerOfSubWITOf(tokenID) { // gets called in cancelAndRedeem and evaluate
      WIT memory the_wit = getWIT(tokenID);
      
      _burn(the_wit.belowID);
      _burn(the_wit.aboveID);

      saveWIT(WIT(tokenID, 0, 0, 0, 0, 0, "", "", 0, 0, false));

    }


    /**
    * @dev Calculates the fee in ARBOL associated with a WIT. Fees are paid by the seller, and are a percentage of the total escrowed ETH amount.
    * @param weiContributing One half of the total escrowed ETH in a partnered WIT pair (an agreement).
    * @param weiAsking The other half of the total escrowed ETH.
    * @return the fee in ARBOL
    */
    function calculateFee(uint weiContributing, uint weiAsking) public constant returns (uint) {
      uint totalEscrow = weiContributing.add(weiAsking);

      if (weiContributing > weiAsking) {         // If user is contributing more than asking, they are the seller and they pay the fee.
        return totalEscrow.mul(systemFeePPM).div(1000000);
      } else if (weiContributing < weiAsking) {
        return 0; // Buyer role pays no fee
      } else {
        return totalEscrow.mul(systemFeePPM).div(1000000).div(2);  // If this is a 50-50 thing, split the fee.
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

    event EvaluatorResponse(uint WITID, bytes32 evaluationResult);

    function evaluate(uint tokenID, string runtimeParams) onlyOwnerOfSubWITOf(tokenID) public {
      WIT memory the_wit = getWIT(tokenID);
      require(the_wit.end < now);
      require(the_wit.aboveID != 0);
      require(the_wit.belowID != 0);

      WITEvaluator evaluator = WITEvaluator(the_wit.evaluator);
      bytes32 outcome = evaluator.evaluateWIT(tokenID, runtimeParams, the_wit.start, the_wit.end, the_wit.threshold, the_wit.location);

      EvaluatorResponse(tokenID, outcome);

      uint totalEscrow = the_wit.aboveEscrow.add(the_wit.belowEscrow);

      if (outcome == keccak256("above")) { // use keccak because == doesn't work for strings.
        burnWIT(tokenID);
        Redemption(tokenID, totalEscrow, ownerOf(the_wit.aboveID));
        ownerOf(the_wit.aboveID).transfer(totalEscrow);
      }

      if (outcome == keccak256("below")) {
        burnWIT(tokenID);
        Redemption(tokenID, totalEscrow, ownerOf(the_wit.belowID));
        ownerOf(the_wit.belowID).transfer(totalEscrow);
      }


    }



    function kill() onlyContractOwner public {
      //
    }


}