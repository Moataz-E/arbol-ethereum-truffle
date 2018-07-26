pragma solidity ^0.4.18;
import "./usingOraclize.sol";
import "./WITEvaluator.sol";
import "./Ownable.sol";
import "./CallbackableWIT.sol";
import "./strings.sol";
import './SafeMath.sol';


contract NOAAPrecipAggregate is usingOraclize, WITEvaluator, Ownable {
    using SafeMath for uint;
    using strings for *;

    string precipScript = "QmRNQhKRThYCQe38Lycj7dTNVCFQ7bFnpQdF8NxqF9jPi4";

    event gotNOAAPrecipAggregateCallback(string key, string result, uint remainingGas);
    event sentNOAAPrecipAggregateOraclizeComputation(string precipScript, uint WITID, string avgedYearsStartEnd, uint thresholdFactorPPTTH, bytes32 area);

    /**
    * @dev 
    * @param WITID The ID of the WIT being evaluated. Needed for the callback.
    * @param start Start date / time of the term period. UNIX formatted timestamp.
    * @param end End date / time of the term period. UNIX formatted timestamp.
    * @param thresholdFactorPPTTH The threshold represented as a part per ten thousand. 10000 = average. 11000 = 10% above average.
    * @param area A string representation of the geographic area to be evaluated. Weather API defines these.
    * @param num_averaged_years Ignores whatever is input and uses 10 years for the number of years to be averaged
    * @param runtimeParams Not used but required by the WITEvaluator interface.
    */
    function evaluateWIT(uint WITID, uint start, uint end, uint thresholdFactorPPTTH, bytes32 area, uint num_averaged_years, string runtimeParams) payable public onlyOwner {
        uint gasEstimate = 500000;
        require(gasEstimate < this.balance);
        require(end.sub(start) < 31618800); //number of seconds in a year
        require(100 < thresholdFactorPPTTH);
        require(thresholdFactorPPTTH < 100000);
        string memory avgedYearsStartEnd = strConcat("10", "&", uint2str(start), "&", uint2str(end));
        oraclize_query("computation", [precipScript, uint2str(WITID), avgedYearsStartEnd, uint2str(thresholdFactorPPTTH), uint2str(uint(area))], gasEstimate);
        sentNOAAPrecipAggregateOraclizeComputation(precipScript, WITID, avgedYearsStartEnd, thresholdFactorPPTTH, area);
    }


    /**
    * @dev Callback function that oraclize uses to return the results of the weather API call.
    * @param myid Something from oraclize related to verification that we don't currently use.
    * @param result The result of the oraclize call in the form "http-response-status-code&wit-id&outcome&average-precpitation&term-precipitation&absolute-threshold"
    */
    function __callback(bytes32 myid, string result) {
        require(msg.sender == oraclize_cbAddress());
        gotNOAAPrecipAggregateCallback("http-response-status-code&wit-id&outcome&average-precpitation&term-precipitation&absolute-threshold", result, msg.gas);
        var sliceResult = result.toSlice();
        var status = sliceResult.split("&".toSlice());
        if (!strings.equals(status, "200".toSlice())) { return; }
        uint WITID =  parseInt(sliceResult.split("&".toSlice()).toString());
        string memory outcome = sliceResult.split("&".toSlice()).toString();
        CallbackableWIT(owner).evaluatorCallback(WITID, outcome);
    }


    /**
    * @dev We set an OAR when using ganache + bridge.
    */
    function setLocalOAR() public onlyOwner {
        //This is only needed when using a local deployment on bridge.
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
    }


    /**
    * @dev Allows contract owner to update the docker image and python script in IPFS.
    * @param scriptHash IPFS multihash of the docker image + python script archive.
    */
    function updateIPFSMultihash(string scriptHash) public onlyOwner {
        precipScript = scriptHash;
    }


    /**
    * @dev Get the name and description of this WIT evaluator.
    */
    function getNameAndDescription() public pure returns(string name, string description) {
        return("NOAA Precipitation Aggregate WIT Evaluator", "This contract makes a call to the NOAA aggregate endpoint and evaluates a WIT based on the result.");
    }


    /**
    * @dev Fallback function.
    */
    function () external payable {}

}