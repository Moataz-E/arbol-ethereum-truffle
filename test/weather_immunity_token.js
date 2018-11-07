let WeatherImmunityToken = artifacts.require("WeatherImmunityToken");
let Arbolcoin = artifacts.require("Arbolcoin")
let EternalDonut = artifacts.require("EternalDonut");
let NOAAPrecipAggregate = artifacts.require("NOAAPrecipAggregate");
let NASACHIRPS = artifacts.require("NASACHIRPS");
let expect = require('expect');
let utils = require("./utils.js");
let BigNumber = require('bignumber.js');
let BN = require('bn.js');

// Dates are in unix timestamp format
let now = Math.round((new Date()).getTime() / 1000);  
let one_month = 2592000;
let one_year = 31622400;
let one_month_from_now = now + one_month;
let two_months_from_now = now + (2 * one_month);
let one_year_ago = now - one_year;


async function testNOAAWIT(proposerAccount, accepterAccount, evaluatorAccount, aboveOrBelow, thresholdPPTTH, ethAsk, ethContribute, start, end, makeStale, WIT, ARBOL, accounts) {

    response = await WIT.createWITProposal(ethContribute, ethAsk, false, NOAAPrecipAggregate.address, thresholdPPTTH, "261", one_year_ago, one_year_ago + one_month, makeStale, {value: ethContribute, from: proposerAccount});
    proposalID = response.logs[0].args.WITID.toNumber()
    response = await WIT.createWITAcceptance(proposalID, {from: accepterAccount, value: ethAsk});
    acceptanceID = response.logs[0].args.WITID.toNumber()
    await WIT.evaluate(acceptanceID, "", {from: evaluatorAccount});
 
}


async function testNASAWIT(proposerAccount, accepterAccount, evaluatorAccount, aboveOrBelow, thresholdPPTTH, ethAsk, ethContribute, start, end, makeStale, WIT, ARBOL, accounts) {

    response = await WIT.createWITProposal(ethContribute, ethAsk, false, NASACHIRPS.address, thresholdPPTTH, "21.5331234,-3.1621234&0.14255", one_year_ago, one_year_ago + one_month, makeStale, {value: ethContribute, from: proposerAccount});
    proposalID = response.logs[0].args.WITID.toNumber();
    response = await WIT.createWITAcceptance(proposalID, {from: accepterAccount, value: ethAsk});
    acceptanceID = response.logs[0].args.WITID.toNumber();
    await WIT.evaluate(acceptanceID, "", {from: evaluatorAccount});
 
}


contract('WeatherImmunityToken', function(accounts) {
    it("should test various WIT creations and acceptances", async function() {
        let WIT = await WeatherImmunityToken.deployed();
        let ARBOL = await Arbolcoin.deployed();
        let DONUT = await EternalDonut.deployed();
        let NOAA = await NOAAPrecipAggregate.deployed();

        await testNASAWIT(accounts[2], accounts[3], accounts[2], false, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], false, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], false, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], false, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[2], false, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], false, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], false, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], false, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await testNASAWIT(accounts[2], accounts[3], accounts[2], true, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], true, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], true, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], true, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[2], true, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], true, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], true, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], true, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await testNASAWIT(accounts[2], accounts[3], accounts[2], false, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], false, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], false, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], false, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[2], false, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], false, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], false, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], false, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await testNASAWIT(accounts[2], accounts[3], accounts[2], true, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], true, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], true, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], true, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[2], true, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], true, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], true, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], true, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await testNASAWIT(accounts[2], accounts[3], accounts[2], false, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], false, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], false, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], false, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[2], false, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], false, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], false, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], false, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await testNASAWIT(accounts[2], accounts[3], accounts[2], true, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], true, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], true, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], true, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[2], true, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], true, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], true, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], true, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);


        await testNASAWIT(accounts[2], accounts[3], accounts[2], false, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], false, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], false, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], false, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[2], false, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], false, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], false, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], false, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await testNASAWIT(accounts[2], accounts[3], accounts[2], true, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], true, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], true, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], true, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[2], true, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], true, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], true, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], true, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await testNASAWIT(accounts[2], accounts[3], accounts[2], false, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], false, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], false, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], false, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[2], false, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], false, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], false, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], false, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await testNASAWIT(accounts[2], accounts[3], accounts[2], true, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], true, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], true, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], true, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[2], true, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[2], accounts[3], accounts[3], true, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[2], true, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await testNASAWIT(accounts[3], accounts[2], accounts[3], true, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await utils.sleep(1200000);  

        await WIT.revert(); 

    });
});

