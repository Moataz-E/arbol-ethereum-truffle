let Arbolcoin = artifacts.require("Arbolcoin")
let EternalDonut = artifacts.require("EternalDonut");
let expect = require('expect');
let utils = require("./utils.js");
let BigNumber = require('bignumber.js');
let BN = require('bn.js');
//let require('truffle-test-utils').init();


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function createWIT(proposerAccount, accepterAccount, evaluatorAccount, aboveOrBelow, thresholdPPTTH, ethAsk, ethContribute, start, end, makeStale, WIT, ARBOL, accounts) {


//    function createWITProposal(uint weiContributing, uint weiAsking, bool aboveOrBelow, address evaluator, uint thresholdPPTTH, bytes32 location, uint start, uint end, bool makeStale) public payable {

    response = await WIT.createWITProposal(ethContribute, ethAsk, false, NOAAPrecipAggregate.address, thresholdPPTTH, numStringToBytes32(261), one_year_ago, one_year_ago + one_month, makeStale, {value: ethContribute, from: proposerAccount});

    proposalID = response.logs[0].args.WITID.toNumber()
    response = await WIT.createWITAcceptance(proposalID, {from: accepterAccount, value: ethAsk});

    acceptanceID = response.logs[0].args.WITID.toNumber()
    await WIT.evaluate(acceptanceID, "", {from: evaluatorAccount});
 

}


contract('WeatherImmunityToken', function(accounts) {
    it("should test various WIT creations and acceptances", async function() {
        this.timeout(7000000)
        let WIT = await WeatherImmunityToken.deployed();
        let ARBOL = await Arbolcoin.deployed();
        let DONUT = await EternalDonut.deployed();
        let NOAA = await NOAAPrecipAggregate.deployed();



        await createWIT(accounts[2], accounts[3], accounts[2], false, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], false, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], false, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], false, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[2], false, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], false, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], false, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], false, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await createWIT(accounts[2], accounts[3], accounts[2], true, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], true, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], true, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], true, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[2], true, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], true, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], true, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], true, 10000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await createWIT(accounts[2], accounts[3], accounts[2], false, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], false, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], false, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], false, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[2], false, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], false, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], false, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], false, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await createWIT(accounts[2], accounts[3], accounts[2], true, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], true, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], true, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], true, 9000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[2], true, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], true, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], true, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], true, 9000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await createWIT(accounts[2], accounts[3], accounts[2], false, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], false, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], false, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], false, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[2], false, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], false, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], false, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], false, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await createWIT(accounts[2], accounts[3], accounts[2], true, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], true, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], true, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], true, 7500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[2], true, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], true, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], true, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], true, 7500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);


        await createWIT(accounts[2], accounts[3], accounts[2], false, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], false, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], false, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], false, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[2], false, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], false, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], false, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], false, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await createWIT(accounts[2], accounts[3], accounts[2], true, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], true, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], true, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], true, 11000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[2], true, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], true, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], true, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], true, 11000, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);


        await createWIT(accounts[2], accounts[3], accounts[2], false, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], false, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], false, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], false, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[2], false, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], false, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], false, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], false, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);

        await createWIT(accounts[2], accounts[3], accounts[2], true, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], true, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], true, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], true, 12500, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[2], true, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[2], accounts[3], accounts[3], true, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[2], true, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
        await createWIT(accounts[3], accounts[2], accounts[3], true, 12500, 400000000000000000, 100000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);


        await sleep(600000);  

     //   WIT.transferOwnershipOfDependants(accounts[0]); 
        await WIT.revert(); 


    });
});





	
