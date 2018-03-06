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

var ethPropose = 9000
var ethAsk = 1000


contract('WeatherImmunityToken', function(accounts) {
    it("should create a WIT proposal and a WIT acceptance with the proposer as the seller", async function() {

        var ethPropose = 9000
        var ethAsk = 1000        
        var proposerAccount = accounts[0];
        var accepterAccount = accounts[3];
        var systemFeeWallet = accounts[9];
        var WIT = await	WeatherImmunityToken.deployed();
        var CROP = await CropToken.deployed();

        var beforeBalance = await web3.eth.getBalance(WIT.address);
      
        var beforeAllowance = await CROP.allowance(proposerAccount, WIT.address);
        assert.equal(beforeAllowance.toNumber(), 0, "CROP allowance isnt initialized to 0");
 	
        var CROPFee = await WIT.calculateFee(ethPropose, ethAsk);

 		var approval = await CROP.approve(WIT.address, CROPFee, {from: proposerAccount});
 		assert(approval, "CROP approval failed");
            
        var afterAllowance = await CROP.allowance(proposerAccount, WIT.address);
        assert.equal(afterAllowance.toNumber(), CROPFee, "allowance of 10000 CROP failed");
    
        await WIT.createWITProposal(ethPropose, ethAsk, "rain", "one inch", "india", one_month_from_now, two_months_from_now, true, {value: ethPropose, from:proposerAccount});
    
        var supply = await WIT.totalSupply();
        assert.equal(supply.toNumber(), 1, "WIT creation failed");
    
       // utils.assertEvent(WIT, {event: "ProposalOffered", logIndex: 1, args: {tokenID: new BigNumber(1)}});
    
        var cropBalance = await CROP.balanceOf(systemFeeWallet);
        assert.equal(cropBalance.toNumber(), CROPFee, "CROP wasn't properly transferred to system wallet");
    
        var afterBalance = await web3.eth.getBalance(WIT.address);
        assert(afterBalance - ethPropose == beforeBalance, 'ETH was not taken from proposer properly');
    
        var owner = await WIT.ownerOf(1);
        assert.equal(proposerAccount, owner);

        // now the acceptance
  
        beforeBalance = await web3.eth.getBalance(WIT.address);

        await WIT.createWITAcceptance(1, {from: accepterAccount, value: ethAsk});

        supply = await WIT.totalSupply();
        assert.equal(supply.toNumber(), 2, "WIT creation failed");

        afterBalance = await web3.eth.getBalance(WIT.address);
        assert(afterBalance - ethAsk == beforeBalance, "Eth was not taken from accepter properly");

        owner = await WIT.ownerOf(2);
        assert.equal(accepterAccount, owner, "Second WIT was not transferred to accepter"); 



    });
});





contract('WeatherImmunityToken', function(accounts) {
    it("should create a WIT proposal and a WIT acceptance with the accepter as the seller", async function() {

        var proposerAccount = accounts[0];
        var accepterAccount = accounts[3];
        var systemFeeWallet = accounts[9];
        var WIT = await	WeatherImmunityToken.deployed();
        var CROP = await CropToken.deployed();
        var ethPropose2 = 1000
        var ethAsk2 = 9000

        var beforeBalance = await web3.eth.getBalance(WIT.address);
    
        await WIT.createWITProposal(ethPropose2, ethAsk2, "rain", "one inch", "india", one_month_from_now, two_months_from_now, true, {value: ethPropose2, from:proposerAccount});
    
        var supply = await WIT.totalSupply();
        assert.equal(supply.toNumber(), 1, "WIT creation failed");
    

        await CROP.transfer(accepterAccount, 20000, {from: proposerAccount});     

        var beforeAllowance = await CROP.allowance(accepterAccount, WIT.address);
        assert.equal(beforeAllowance.toNumber(), 0, "CROP allowance isnt initialized to 0");
 	
        var CROPFee = await WIT.calculateFee(ethAsk2, ethPropose2);


 		var approval = await CROP.approve(WIT.address, CROPFee, {from: accepterAccount});
 		assert(approval, "CROP approval failed");
    
        var afterAllowance = await CROP.allowance(accepterAccount, WIT.address);
        assert.equal(afterAllowance.toNumber(), CROPFee, "allowance of 10000 CROP failed");

        beforeBalance = await web3.eth.getBalance(WIT.address);

        await WIT.createWITAcceptance(1, {from: accepterAccount, value: ethAsk2});

        supply = await WIT.totalSupply();
        assert.equal(supply.toNumber(), 2, "WIT creation failed");

        afterBalance = await web3.eth.getBalance(WIT.address);
        assert(afterBalance - ethAsk2 == beforeBalance, "Eth was not taken from accepter properly");

        owner = await WIT.ownerOf(2);
        assert.equal(accepterAccount, owner, "Second WIT was not transferred to accepter");        

        var cropBalance = await CROP.balanceOf(systemFeeWallet);
        assert.equal(cropBalance.toNumber(), CROPFee, "CROP wasn't properly transferred to system wallet");

    }); 
}); 



	
