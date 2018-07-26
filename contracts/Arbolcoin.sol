pragma solidity ^0.4.18;

import './StandardToken.sol';
import './Ownable.sol';

contract Arbolcoin is StandardToken, Ownable {

  string public constant name = "Arbolcoin"; // solium-disable-line uppercase
  string public constant symbol = "ARBOL"; // solium-disable-line uppercase
  uint8 public constant decimals = 18; // solium-disable-line uppercase
  uint256 public constant INITIAL_SUPPLY = 100000000 * (10 ** uint256(decimals)); // supply of 100,000,000
  bool initialized = false;

  function initialize(address storageContract) public onlyOwner {
    require(!initialized);
    initialize(storageContract, INITIAL_SUPPLY);
    BasicToken.setBalance(msg.sender, INITIAL_SUPPLY);
    Transfer(0x0, msg.sender, INITIAL_SUPPLY);    
    initialized = true;
  }

}
