pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
//import './CropToken.sol' as CropToken;

/**
 * @title Weather Immunity Token for crop and weather protection
 *
 * @dev If you hold this token you are eligible for a payout based on the outcome of the weather.
 * @dev Various terms can be set.
 */
contract WeatherImmunityToken is ERC721Token {

    
  // Mapping from token ID to partner token ID
  mapping (uint256 => uint256) private tokenPartners;

  event CreatedWIT(address owner, uint256 tokenID);
  event WITsPartnered(uint256 tokenIDOne, uint256 tokenIDTwo);

    function createWIT(uint256 partnerID) public {

      uint256 newID = totalSupply() + 1; // index 0 never gets used.
      // TODO check for overflow condition of ^

      // If a partnerID is specified, that token must be unparterned. 
      // Or 0 can be specified, meaning we are creating an unpartnered token.
      require(tokenPartners[partnerID] == 0); 

      //other validation happens here

      _mint(msg.sender, newID);
      CreatedWIT(msg.sender, newID);

      if(partnerID != 0){
        makePartners(partnerID, newID);
      }

    }

    function makePartners(uint256 firstPartnerID, uint256 secondPartnerID) public {
      tokenPartners[firstPartnerID] = secondPartnerID;
      tokenPartners[secondPartnerID] = firstPartnerID;
      WITsPartnered(firstPartnerID, secondPartnerID);
    }

    function partnerOf(uint256 tokenID) public view returns (uint256) {
      return tokenPartners[tokenID]; 
    }

}