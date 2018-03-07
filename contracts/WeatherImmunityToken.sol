pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Arbolcoin.sol';

/**
 * @title Weather Immunity Token for ARBOL and weather protection agreements.
 *
 * @dev If you hold this token you are eligible for a payout based on the outcome of the weather.
 * @dev WITs are a representation of a protection agreement between two parties.
 * @dev Various terms can be set by the "proposer." The proposal is represented as one WIT.
 * @dev The proposal can be accepted. If it is accepted, a new WIT is created according to the terms specified in the first one.
 * @dev WITs can be transferred after they have been created. They are a nonfungible ERC721 tokens.
 */
contract WeatherImmunityToken is ERC721Token {
  using SafeMath for uint;

    // A struct which represents all the values in a WIT.
    struct WIT {
      uint weiEscrow;
      uint weiPartnerEscrow;
      string index;
      string threshold;
      string location;
      uint partnerID;
      uint start;
      uint end;
      bool makeStale;
    }

    // WIT IDs => WIT structs
    mapping (uint => WIT) public WITs;  

    // Name of weather API => address of contract that will hit it.
    mapping (string => address) private weatherAPIAddresses;

    // Trusted address to add new weatherAPI contracts.
    address weatherAPIAdder = 0x6330A553Fc93768F612722BB8c2eC78aC90B3bbc;

    // Trusted address to update the system fee rate.
    address systemFeeSetter = 0x0F4F2Ac550A1b4e2280d04c21cEa7EBD822934b5;

    // Arbolcoin smart contract (contains address). 
    Arbolcoin arbolContract;

    // ARBOL fees go to this wallet.
    address systemFeeWallet = 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE;

    // All the weatherAPI names
    string[] public weatherAPIs;

    // The ARBOL system fee in parts per million. (of wei.) 100% for now.
    uint public systemFeePPM = 1000000;

    // Use a simple counter to create new token IDs.
    uint private tokenIDCounter = 0;

    // These are to facilitate queries related to getting open proposals.
    event Redemption(uint indexed tokenID, uint  amount, address indexed user);
    event ProposalAccepted(uint indexed tokenIDProposer, uint indexed tokenIDAccepter);
    event ProposalOffered(uint indexed tokenID, uint indexed weiContributing, uint indexed weiAsking, string index, string threshold, string location, uint start, uint end);


   /**
    * @dev Constructor which sets the Arbolcoin address.
    * @param _arbolAddress The address of the Arbolcoin contract.
   */    
    function WeatherImmunityToken(address _arbolAddress) public {
      arbolContract = Arbolcoin(_arbolAddress);
    }


   /**
    * @dev Create a WIT without a partner. (A proposal.)
    * @param weiContributing Amount of wei user proposes to contribute
    * @param weiAsking Amount of wei user proposes the partner contribute.
    * @param index The weather API index by which payout will be determined.
    * @param threshold The threshold by which the payout will be determined.
    * @param start The start date of the WIT.
    * @param end The end date of the WIT.
    * @param makeStale If set to true, the WIT will be taken off the open market after its start date passes. That is, no one will be able to accept it.
    */
    function createWITProposal(uint weiContributing, uint weiAsking, string index, string threshold, string location, uint start, uint end, bool makeStale) public payable {

      require(weiContributing > 0);
      require(weiAsking > 0);

      require(now < start); // Don't let people create WITs that start in the past. Opens the door for abuse.
      require(start < end);

      // validate index, threshold and location TODO
  
      // Validate amount of wei sent.
      require(msg.value == weiContributing);

      // Calculate and take ARBOL fee.
      uint fee = calculateFee(weiContributing, weiAsking);

      if (fee != 0) {
          require(arbolContract.transferFrom(msg.sender, systemFeeWallet, fee));
      }

      uint ID = tokenIDCounter.add(1);
      WITs[ID] = WIT(weiContributing, weiAsking, index, threshold, location, 0, start, end, makeStale);
      _mint(msg.sender, ID);
      tokenIDCounter = ID;

      ProposalOffered(ID, weiContributing, weiAsking, index, threshold, location, start, end);
    }


    /**
    * @dev Create a WIT and partner it to an existing WIT (accept a proposed protection agreement).
    * @param proposalID The ID of the WIT to which the new WIT shall be partnered.
    */
    function createWITAcceptance(uint proposalID) public payable {

      // Specified partner token must exist
      require(ownerOf(proposalID) != address(0));
  
      // Specified partner must not already have a partner.
      require(WITs[proposalID].partnerID == 0);

      if (WITs[proposalID].makeStale) {
        require(now < WITs[proposalID].start);
      }

      // Validate amount of wei sent.
      require(msg.value == WITs[proposalID].weiPartnerEscrow);

      // Calculate and take ARBOL fee.
      uint fee = calculateFee(WITs[proposalID].weiPartnerEscrow, WITs[proposalID].weiEscrow);
      if (fee != 0) {
          require(arbolContract.transferFrom(msg.sender, systemFeeWallet, fee));
      }

      // Create the token and set the "proposal" as "accepted."
      uint ID = tokenIDCounter.add(1);
      WITs[ID] = WIT(WITs[proposalID].weiEscrow, WITs[proposalID].weiPartnerEscrow, WITs[proposalID].index, WITs[proposalID].threshold, WITs[proposalID].location, proposalID, WITs[proposalID].start, WITs[proposalID].end, false);
      _mint(msg.sender, ID);
      tokenIDCounter = ID;
      WITs[proposalID].partnerID = ID;
      ProposalAccepted(proposalID, ID);
    }


    /**
    * @dev Burns a specific token.
    * @param tokenID uint ID of the token being burned by the msg.sender
    */
    function burnWIT(uint tokenID) private onlyOwnerOf (tokenID){
      WITs[WITs[tokenID].partnerID] = WITs[0]; // fix later TODO
      WITs[tokenID] = WITs[0];
      _burn(tokenID);
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
        return 0; // Buyer role pays no feel
      } else {
        return totalEscrow.mul(systemFeePPM).div(1000000).div(2);  // If this is a 50-50 thing, split the fee.
      }
    }


    /**
    * @dev Add a new weather API to the roster.
    */    
    function addWeatherAPI(string name, address contractAddress) public {
      require(msg.sender == weatherAPIAdder);
      require(weatherAPIAddresses[name] == 0);
      weatherAPIAddresses[name] = contractAddress;
    }


    /**
    * @dev Set the system fee to a new value. This doesn't affect existing WITs.
    */ 
    function setSystemFee(uint fee) public {
      require(msg.sender == systemFeeSetter);
      require(0 <= fee);
      systemFeePPM = fee;
    }


    /**
    * @dev Cancel an unpartnered WIT that you have created. Redeem the ETH escrowed therein.
    * @param tokenID The ID of your token that you want to cancel.
    TODO ARBOL redemption
    */ 
    function cancelAndRedeem(uint tokenID) onlyOwnerOf(tokenID) public {
      uint redemptionAmount = WITs[tokenID].weiEscrow;
      require(WITs[tokenID].partnerID == 0); 
      burnWIT(tokenID);
      msg.sender.transfer(redemptionAmount);
      Redemption(tokenID, redemptionAmount, msg.sender);
      
    }


}