pragma solidity ^0.4.18;
import "installed_contracts/oraclize-api/contracts/usingOraclize.sol";
import "./CBOR.sol";
import "./WITEvaluator.sol";
import "./Ownable.sol";
import "./CallbackableWIT.sol";
import "./strings.sol";
import 'zeppelin-solidity/contracts/math/SafeMath.sol';


contract NOAAPrecipAggregate is usingOraclize, WITEvaluator, Ownable {
    using SafeMath for uint;
    using CBOR for Buffer.buffer;
    using strings for *;
    string precipScript = "QmRNQhKRThYCQe38Lycj7dTNVCFQ7bFnpQdF8NxqF9jPi4";
    event gotNOAAPrecipAggregateCallback(string key, string result);
    event sendingNOAAPrecipOraclizeComputation(bytes precipScript, uint WITID, uint timescale, bytes32 area, uint month, uint term_year, uint average_basis);


    /*
    Assumes "num_averaged_years" to be 10.  start and end must be = within 12 months of each other.
    */
    function evaluateWIT(uint WITID, uint start, uint end, uint thresholdFactorPPM, bytes32 area, uint num_averaged_years, string runtimeParams) payable public onlyContractOwner {
        uint gasEstimate = 500000;
        require(gasEstimate < this.balance);
        require(end.sub(start) < 31618800); //number of seconds in a year
        require(1 < thresholdFactorPPM);
        require(thresholdFactorPPM < 3000000);
        string memory avgedyearsStartEnd = strConcat("10", "&", uint2str(start), "&", uint2str(end));
        oraclize_query("computation", [precipScript, uint2str(WITID), avgedyearsStartEnd, uint2str(thresholdFactorPPM), uint2str(uint(area))], gasEstimate);
    }


    function __callback(bytes32 myid, string result) {
        require(msg.sender == oraclize_cbAddress());
        gotNOAAPrecipAggregateCallback("http-response-status-code&wit-id&outcome&average-precpitation&term-precipitation&absolute-threshold", result);
        var sliceResult = result.toSlice();
        var status = sliceResult.split("&".toSlice());
        if (!strings.equals(status, "200".toSlice())) { return; }
        uint WITID =  parseInt(sliceResult.split("&".toSlice()).toString());
        string memory outcome = sliceResult.split("&".toSlice()).toString();
        CallbackableWIT(owner).evaluatorCallback(WITID, outcome);
    }


    function NOAAPrecipAggregate() public {
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
    }


    function updateIPFSMultihash(string scriptHash) public onlyContractOwner {
        precipScript = scriptHash;
    }

    function getNameAndDescription() public pure returns(string name, string description) {
        return("NOAA Precipitation Aggregate WIT Evaluator", "This contract makes a call to the NOAA aggregate endpoint and evaluates a WIT based on the result.");
    }

    function () external payable {
    }

}