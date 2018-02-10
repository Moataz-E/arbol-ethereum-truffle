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

    function CreateToken() public {
      _mint(msg.sender, totalSupply());
    }

}

