var WeatherImmunityToken = artifacts.require("WeatherImmunityToken");
var CropToken = artifacts.require("CropToken")
var expect = require('expect');
var utils = require("./utils.js");
var BigNumber = require('bignumber.js');


// Dates are in unix timestamp format
var now = Math.round((new Date()).getTime() / 1000);  
var one_month = 2629746000;
var one_month_from_now = now + one_month;
var two_months_from_now = now + (2 * one_month);

let ethPropose = 9000
let ethAsk = 1000


contract('WeatherImmunityToken', function(accounts) {
    it("should create a WIT proposal and a WIT acceptance", async function() {

        

        let WIT = await	WeatherImmunityToken.deployed();
        let CROP = await CropToken.deployed();

        let beforeBalance = await web3.eth.getBalance(WIT.address);
      
        let beforeAllowance = await CROP.allowance(accounts[0], WIT.address);
        assert.equal(beforeAllowance.toNumber(), 0, "CROP allowance isnt initialized to 0");
 	
 		let approval = CROP.approve(WIT.address, ethPropose + ethAsk, {from: accounts[0]});
 		assert(approval, "CROP approval failed");
    
        let afterAllowance = await CROP.allowance(accounts[0], WIT.address);
        assert.equal(afterAllowance.toNumber(), ethPropose + ethAsk, "allowance of 10000 CROP failed");
    
        await WIT.createWITProposal(ethPropose, ethAsk, "rain", "one inch", "india", one_month_from_now, two_months_from_now, true, {value: ethPropose, from:accounts[0]});
    
        let supply = await WIT.totalSupply();
        assert.equal(supply.toNumber(), 1, "WIT creation failed");
    
       // utils.assertEvent(WIT, {event: "ProposalOffered", logIndex: 1, args: {tokenID: new BigNumber(1)}});
    
        let cropBalance = await CROP.balanceOf(accounts[9]);
        assert.equal(cropBalance, ethPropose + ethAsk, "CROP wasn't properly transferred to system wallet");
    
        let afterBalance = await web3.eth.getBalance(WIT.address);
        assert(afterBalance - ethPropose == beforeBalance, 'ETH was not taken from proposer properly');
    
        let owner = await WIT.ownerOf(1);
        assert.equal(accounts[0], owner);

        // now the acceptance
  
        beforeBalance = await web3.eth.getBalance(WIT.address);

        await WIT.createWITAcceptance(1, {from: accounts[1], value: ethAsk});

        supply = await WIT.totalSupply();
        assert.equal(supply.toNumber(), 2, "WIT creation failed");

        afterBalance = await web3.eth.getBalance(WIT.address);
        assert(afterBalance - ethAsk == beforeBalance, "Eth was not taken from accepter properly");

        owner = await WIT.ownerOf(2);
        assert.equal(accounts[1], owner);        

    });
});
	
