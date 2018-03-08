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
        let result = await NOAA.testQuery();
        //console.log(result);
       // let resultt = await NOAA.getResultt();
        //console.log(resultt);

        await sleep(4000);
}); 

}); 



	
