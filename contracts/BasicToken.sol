pragma solidity ^0.4.18;


import "./ERC20Basic.sol";
import "./SafeMath.sol";
import "./EternalDonut.sol";

/**
 * @title Basic token
 * @dev Basic version of StandardToken, with no allowances.
 */
contract BasicToken is ERC20Basic {
  using SafeMath for uint256;

  EternalDonut internal storageContract;
  string private constant contractName = "BasicToken";

  function initialize(address storageAddress, uint256 totalSupply) internal {
    storageContract = EternalDonut(storageAddress);
    storageContract.setUIntValue(keccak256(contractName, "totalSupply"), totalSupply);
  }

  function setBalance(address _owner, uint balance) internal {
    storageContract.setUIntValue(keccak256(contractName, "balances", _owner), balance);
  } 

  /**
  * @dev Total number of tokens in existence
  */
  function totalSupply() public view returns (uint256) {
    return storageContract.getUIntValue(keccak256(contractName, "totalSupply"));
  }

  /**
  * @dev Transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) public returns (bool) {
    uint balance = balanceOf(msg.sender);
    require(_value <= balance);
    require(_to != address(0));

    setBalance(msg.sender, balance.sub(_value));
    setBalance(_to, balanceOf(_to).add(_value));
    Transfer(msg.sender, _to, _value);
    return true;
  }


  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) public view returns (uint256) {
    return storageContract.getUIntValue(keccak256(contractName, "balances", _owner));
  }

}
