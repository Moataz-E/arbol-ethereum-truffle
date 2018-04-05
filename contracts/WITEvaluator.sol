pragma solidity ^0.4.18;

import "./Ownable.sol";

contract WITEvaluator is Ownable
{
	function evaluateWIT(uint WITID, string runtimeParams, uint start, uint end, bytes32 threshold, bytes32 location) public returns (bytes32 result);

	function getNameAndDescription() public pure returns(string name, string description);

}