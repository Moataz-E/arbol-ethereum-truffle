var WeatherImmunityToken = artifacts.require("WeatherImmunityToken");
var Arbolcoin = artifacts.require("Arbolcoin")
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
        var ARBOL = await Arbolcoin.deployed();

        var beforeBalance = await web3.eth.getBalance(WIT.address);
      
        var beforeAllowance = await ARBOL.allowance(proposerAccount, WIT.address);
        assert.equal(beforeAllowance.toNumber(), 0, "ARBOL allowance isnt initialized to 0");
 	
        var ARBOLFee = await WIT.calculateFee(ethPropose, ethAsk);

 		var approval = await ARBOL.approve(WIT.address, ARBOLFee, {from: proposerAccount});
 		assert(approval, "ARBOL approval failed");
            
        var afterAllowance = await ARBOL.allowance(proposerAccount, WIT.address);
        assert.equal(afterAllowance.toNumber(), ARBOLFee, "allowance of 10000 ARBOL failed");
    
        await WIT.createWITProposal(ethPropose, ethAsk, "rain", "one inch", "india", one_month_from_now, two_months_from_now, true, {value: ethPropose, from:proposerAccount});
    
        var supply = await WIT.totalSupply();
        assert.equal(supply.toNumber(), 1, "WIT creation failed");
    
       // utils.assertEvent(WIT, {event: "ProposalOffered", logIndex: 1, args: {tokenID: new BigNumber(1)}});
    
        var arbolBalance = await ARBOL.balanceOf(systemFeeWallet);
        assert.equal(arbolBalance.toNumber(), ARBOLFee.toNumber(), "ARBOL wasn't properly transferred to system wallet");
    
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
        var ARBOL = await Arbolcoin.deployed();
        var ethPropose2 = 1000
        var ethAsk2 = 9000

        var beforeBalance = await web3.eth.getBalance(WIT.address);
    
        await WIT.createWITProposal(ethPropose2, ethAsk2, "rain", "one inch", "india", one_month_from_now, two_months_from_now, true, {value: ethPropose2, from:proposerAccount});
    
        var supply = await WIT.totalSupply();
        assert.equal(supply.toNumber(), 1, "WIT creation failed");

        await ARBOL.transfer(accepterAccount, 20000, {from: proposerAccount});     

        var beforeAllowance = await ARBOL.allowance(accepterAccount, WIT.address);
        assert.equal(beforeAllowance.toNumber(), 0, "ARBOL allowance isnt initialized to 0");
 	
        var ARBOLFee = await WIT.calculateFee(ethAsk2, ethPropose2);


 		var approval = await ARBOL.approve(WIT.address, ARBOLFee, {from: accepterAccount});
 		assert(approval, "ARBOL approval failed");
    
        var afterAllowance = await ARBOL.allowance(accepterAccount, WIT.address);
        assert.equal(afterAllowance.toNumber(), ARBOLFee.toNumber(), "allowance of 10000 ARBOL failed");

        beforeBalance = await web3.eth.getBalance(WIT.address);

        await WIT.createWITAcceptance(1, {from: accepterAccount, value: ethAsk2});

        supply = await WIT.totalSupply();
        assert.equal(supply.toNumber(), 2, "WIT creation failed");

        afterBalance = await web3.eth.getBalance(WIT.address);
        assert(afterBalance - ethAsk2 == beforeBalance, "Eth was not taken from accepter properly");

        owner = await WIT.ownerOf(2);
        assert.equal(accepterAccount, owner, "Second WIT was not transferred to accepter");        

        var arbolBalance = await ARBOL.balanceOf(systemFeeWallet);
        assert.equal(arbolBalance.toNumber(), ARBOLFee.toNumber(), "ARBOL wasn't properly transferred to system wallet");

    }); 
}); 






	
