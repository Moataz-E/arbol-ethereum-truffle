pragma solidity ^0.4.18;
import "./usingOraclize.sol";
import "./urlRequests.sol";

contract NOAANCDCRainfall is usingOraclize {

    string baseURL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND";
    string requestsIPFSHash = "QmdKK319Veha83h6AYgQqhx9YRsJ9MJE7y33oCXyZ4MqHE";
    string headers = "{'headers': {'token': [decrypt] BK6xM+kdW3gGfeqLYck8hyEvLzSl/9Bxla4sf70ztF0a28kQx0J2CapMC9mVYpaDb5ELvxs6owuMpdsEOIEA9Os86vDhCA7R8ekIRoHMjbxXFdQdEcTL8vpyQhPAP3HZ7iUWMFs6FR5zaeisIGWFGuo=}}";

    string testResult = "not set";
    address sender;
    address cbaddress;



    function getResult() public returns (string, address, address) {
    	return (testResult, sender, cbaddress);
    }

    event newOraclizeQuery(string message);

    event debug(address sender, address cbaddress, string result);

    function NOAARequest(string _query, string _url) private {
        if (oraclize_getPrice("computation") > this.balance) {
            newOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            newOraclizeQuery("Oraclize query was sent, standing by for the answer...");

            oraclize_query("computation",
                [_query,
                "GET",
                _url,
                headers]
            );
        }
    }


    function Request() {
    	//NOAARequest("json(" + requestsIPFSHash + ")", baseURL + "&startdate=1970-10-03&enddate=1971-09-03");
    	NOAARequest("json(QmdKK319Veha83h6AYgQqhx9YRsJ9MJE7y33oCXyZ4MqHE)", "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=PRECIP_HLY&startdate=1970-10-03&enddate=1971-09-03");
    }


    function testQuery() {
        oraclize_query("URL", "json(https://www.therocktrading.com/api/ticker/BTCEUR).result.0.last");
    }

    function __callback(bytes32 myid, string result) {
       // require(msg.sender == oraclize_cbAddress());
        testResult = result;
        sender = msg.sender;
        cbaddress = oraclize_cbAddress();
        debug(msg.sender, oraclize_cbAddress(), result);
    }

    function NOAANCDCRainfall() {

OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
}
}