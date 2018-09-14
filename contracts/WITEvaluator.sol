pragma solidity 0.4.18;

import "./Ownable.sol";

contract WITEvaluator
{
    function evaluateWIT(uint WITID, uint start, uint end, uint thresholdFactorPPM, bytes32 area, uint num_averaged_years, string runtimeParams) payable public;
	function getNameAndDescription() public pure returns(string name, string description);
}