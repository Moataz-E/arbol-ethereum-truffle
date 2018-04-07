let WeatherImmunityToken = artifacts.require("WeatherImmunityToken");
let Arbolcoin = artifacts.require("Arbolcoin")
let EternalDonut = artifacts.require("EternalDonut");
let expect = require('expect');
let utils = require("./utils.js");
let BigNumber = require('bignumber.js');


// Dates are in unix timestamp format
let now = Math.round((new Date()).getTime() / 1000);  
let one_month = 2629746000;
let one_month_from_now = now + one_month;
let two_months_from_now = now + (2 * one_month);

let ethContribute = 9000
let ethAsk = 1000

async function createWIT(proposerAccount, accepterAccount, ethContribute, ethAsk, WIT, ARBOL, accounts) {

            let systemFeeWallet = accounts[9];


    let beforeBalance = await web3.eth.getBalance(WIT.address);

    let beforeAllowance = await ARBOL.allowance(proposerAccount, WIT.address);
    assert.equal(beforeAllowance.toNumber(), 0, "ARBOL allowance isnt initialized to 0");

    let ARBOLFee = await WIT.calculateFee(ethContribute, ethAsk);

    let approval = await ARBOL.approve(WIT.address, ARBOLFee, {from: proposerAccount});

    let afterAllowance = await ARBOL.allowance(proposerAccount, WIT.address);
    assert.equal(afterAllowance.toNumber(), ARBOLFee, "allowance of 10000 ARBOL failed");

    let beforeSupply = await WIT.totalSupply.call();


    let offeredEvent = WIT.ProposalOffered({}, {fromBlock: 'latest', toBlock: 'latest'}).watch(async function(error, result) {

        let proposalID = result.args.WITID;

        await WIT.createWITProposal(ethContribute, ethAsk, true, 0, "one inch", "india", one_month_from_now, two_months_from_now, true, {value: ethContribute, from: proposerAccount});
    
        let afterSupply = await WIT.totalSupply.call();
        assert.equal(afterSupply.toNumber() - beforeSupply.toNumber(), 1, "WIT creation failed");
    
        // utils.assertEvent(WIT, {event: "ProposalOffered", logIndex: 1, args: {tokenID: new BigNumber(1)}});
    
        let arbolBalance = await ARBOL.balanceOf(systemFeeWallet);
        assert.equal(arbolBalance.toNumber(), ARBOLFee.toNumber(), "ARBOL wasn't properly transferred to system wallet");
    
        let afterBalance = await web3.eth.getBalance(WIT.address);
        assert(afterBalance - ethContribute == beforeBalance, 'ETH was not taken from proposer properly');
    
        let owner = await WIT.ownerOf(1);
        assert.equal(proposerAccount, owner);

        // now the acceptance
  
        beforeBalance = await web3.eth.getBalance(WIT.address);

        beforeSupply = await WIT.totalSupply.call();

        await WIT.createWITAcceptance(proposalID, {from: accepterAccount, value: ethAsk});

        afterSupply = await WIT.totalSupply.call();
        assert.equal(afterSupply.toNumber() - beforeSupply.toNumber(), 1, "WIT creation failed");

        supply = await WIT.totalSupply.call();
        assert.equal(supply.toNumber(), 2, "WIT creation failed");

        afterBalance = await web3.eth.getBalance(WIT.address);
        assert(afterBalance - ethAsk == beforeBalance, "Eth was not taken from accepter properly");

        owner = await WIT.ownerOf(2);
        assert.equal(accepterAccount, owner, "Second WIT was not transferred to accepter");

    });

    offeredEvent.stopWatching();

}


contract('WeatherImmunityToken', function(accounts) {
    it("should test various WIT creations and acceptances", async function() {



        let ethContribute = 9000
        let ethAsk = 1000        
        let proposerAccount = accounts[0];
        let accepterAccount = accounts[3];
        let systemFeeWallet = accounts[9];
        let WIT = await	WeatherImmunityToken.deployed();
        let ARBOL = await Arbolcoin.deployed();
        let DONUT = await EternalDonut.deployed();

        await DONUT.transferOwnership(WIT.address, {from:accounts[0]});
        await WIT.initialize({from:accounts[0]});

        await createWIT(accounts[0], accounts[3], 1000, 9000, WIT, ARBOL, accounts);
        await createWIT(accounts[0], accounts[3], 2000, 8000, WIT, ARBOL, accounts);
        await createWIT(accounts[0], accounts[3], 3000, 7000, WIT, ARBOL, accounts);
        await createWIT(accounts[0], accounts[3], 4000, 6000, WIT, ARBOL, accounts);
        await createWIT(accounts[0], accounts[3], 5000, 5000, WIT, ARBOL, accounts);
        await createWIT(accounts[0], accounts[3], 6000, 4000, WIT, ARBOL, accounts);
        await createWIT(accounts[0], accounts[3], 7000, 3000, WIT, ARBOL, accounts);
        await createWIT(accounts[0], accounts[3], 8000, 2000, WIT, ARBOL, accounts);        
        await createWIT(accounts[0], accounts[3], 9000, 1000, WIT, ARBOL, accounts);        

    });
});






	
