var NOAANCDCRainfall = artifacts.require("NOAANCDCRainfall");
var expect = require('expect');
var utils = require("./utils.js");
var BigNumber = require('bignumber.js');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

contract('NOAANCDCRainfall', function(accounts) {
    it("should make an oraclize call", async function() {

        await sleep(4000);

        let NOAA = await NOAANCDCRainfall.deployed();
        await NOAA.testQuery();

        await sleep(10000);

        let result = await NOAA.getResult.call();
        assert(result != "not set", "__callback function was not called. Try restarting ganache-cli and ethereum bridge.")

}); 

}); 



	
