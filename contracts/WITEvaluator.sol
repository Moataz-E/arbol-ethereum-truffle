pragma solidity 0.4.24;

import "./Ownable.sol";

contract WITEvaluator
{
    function evaluateWIT(uint WITID, uint start, uint end, uint thresholdFactorPPM, string location, uint num_averaged_years, string runtimeParams) payable public;
	function getNameAndDescription() public pure returns(string name, string description);
}