let WeatherImmunityToken = artifacts.require("WeatherImmunityToken");
let Arbolcoin = artifacts.require("Arbolcoin")
let EternalDonut = artifacts.require("EternalDonut");
let NOAAPrecipAggregate = artifacts.require("NOAAPrecipAggregate");
let NASACHIRPS = artifacts.require("NASACHIRPS");
let expect = require('expect');
let utils = require("./utils.js");
let BigNumber = require('bignumber.js');
let BN = require('bn.js');
//let require('truffle-test-utils').init();


// Dates are in unix timestamp format
let now = Math.round((new Date()).getTime() / 1000);  
let one_month = 2592000;
let one_year = 31622400;
let one_month_from_now = now + one_month;
let two_months_from_now = now + (2 * one_month);
let one_year_ago = now - one_year;


function numStringToBytes32(num) { 
    var bn = new BN(num).toTwos(256);
   return padToBytes32(bn.toString(16));
}


function bytes32ToNumString(bytes32str) {
    bytes32str = bytes32str.replace(/^0x/, '');
    var bn = new BN(bytes32str, 16).fromTwos(256);
    return bn.toString();
}


function padToBytes32(n) {
    while (n.length < 64) {
        n = "0" + n;
    }
    return "0x" + n;
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function createNOAAWIT(proposerAccount, accepterAccount, evaluatorAccount, aboveOrBelow, thresholdPPTTH, ethAsk, ethContribute, start, end, makeStale, WIT, ARBOL, accounts) {


//    function createWITProposal(uint weiContributing, uint weiAsking, bool aboveOrBelow, address evaluator, uint thresholdPPTTH, bytes32 location, uint start, uint end, bool makeStale) public payable {

    response = await WIT.createWITProposal(ethContribute, ethAsk, false, NOAAPrecipAggregate.address, thresholdPPTTH, numStringToBytes32(261), one_year_ago, one_year_ago + one_month, makeStale, {value: ethContribute, from: proposerAccount});

    proposalID = response.logs[0].args.WITID.toNumber()
    response = await WIT.createWITAcceptance(proposalID, {from: accepterAccount, value: ethAsk});

    acceptanceID = response.logs[0].args.WITID.toNumber()
    await WIT.evaluate(acceptanceID, "", {from: evaluatorAccount});
 

}


async function createNASAWIT(proposerAccount, accepterAccount, evaluatorAccount, aboveOrBelow, thresholdPPTTH, ethAsk, ethContribute, start, end, makeStale, WIT, ARBOL, accounts) {

   // function createWITProposal(uint weiContributing, uint weiAsking, bool aboveOrBelow, address evaluator, uint thresholdPPTTH, bytes location, uint start, uint end, bool makeStale) public payable {

    response = await WIT.createWITProposal(ethContribute, ethAsk, false, NASACHIRPS.address, thresholdPPTTH, "21.5331234,-3.1621234&0.14255", one_year_ago, one_year_ago + one_month, makeStale, {value: ethContribute, from: proposerAccount});

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



        await createNASAWIT(accounts[2], accounts[3], accounts[2], false, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
    /*    await createWIT(accounts[2], accounts[3], accounts[3], false, 10000, 100000000000000000, 400000000000000000, now - one_year, now - one_year + one_month, false, WIT, ARBOL, accounts);
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
*/

        await sleep(600000);  

     //   WIT.transferOwnershipOfDependants(accounts[0]); 
        await WIT.revert(); 


    });
});





/*
async function createWIT(proposerAccount, accepterAccount, ethContribute, ethAsk, WIT, ARBOL, accounts) {

    let systemFeeWallet = accounts[9];

    let beforeBalance = await web3.eth.getBalance(WIT.address);

    let beforeAllowance = await ARBOL.allowance(proposerAccount, WIT.address);
   // assert.equal(beforeAllowance.toNumber(), 0, "ARBOL allowance isnt initialized to 0");

    let ARBOLFee = await WIT.calculateFee(ethContribute, ethAsk);

    let approval = await ARBOL.approve(WIT.address, ARBOLFee, {from: proposerAccount});

    let afterAllowance = await ARBOL.allowance(proposerAccount, WIT.address);
   // assert.equal(afterAllowance.toNumber(), ARBOLFee, "allowance of 10000 ARBOL failed");

    let beforeSupply = await WIT.totalSupply.call();
   // console.log("before supply: " + beforeSupply)

    console.log(numStringToBytes32(261));

    await WIT.createWITProposal(ethContribute, ethAsk, false, NOAAPrecipAggregate.address, 30000, numStringToBytes32(261), one_year_ago, one_year_ago + one_month, false, {value: ethContribute, from: proposerAccount});


  //  let offeredEvent = WIT.ProposalOffered({}, {fromBlock: 'latest', toBlock: 'latest'}).watch(async function(error, result) {



    //     proposalID = result.args.WITID;
   // });

//    offeredEvent.stopWatching();


    
        let afterSupply = await WIT.totalSupply.call();
//console.log("after supply:" + afterSupply)

  //      assert.equal(afterSupply.toNumber() - beforeSupply.toNumber(), 1, "WIT creation failed");
    
        // utils.assertEvent(WIT, {event: "ProposalOffered", logIndex: 1, args: {tokenID: new BigNumber(1)}});
    
        let arbolBalance = await ARBOL.balanceOf(systemFeeWallet);
    //    assert.equal(arbolBalance.toNumber(), ARBOLFee.toNumber(), "ARBOL wasn't properly transferred to system wallet");
    
        let afterBalance = await web3.eth.getBalance(WIT.address);
      //  assert(afterBalance - ethContribute == beforeBalance, 'ETH was not taken from proposer properly');
    
        let owner = await WIT.ownerOf(1);
    //    assert.equal(proposerAccount, owner);

        // now the acceptance
  
        beforeBalance = await web3.eth.getBalance(WIT.address);

        beforeSupply = await WIT.totalSupply.call();

     //   console.log("proposal id:" + proposalID)

        await WIT.createWITAcceptance(parseInt(afterSupply), {from: accepterAccount, value: ethAsk});


        await WIT.evaluate(parseInt(afterSupply), "", {from: accepterAccount});


//        await WIT.evaluatorCallback(parseInt(afterSupply), "above")

        await WIT.asdf();

     //}


        afterSupply = await WIT.totalSupply.call();
        assert.equal(afterSupply.toNumber() - beforeSupply.toNumber(), 1, "WIT creation failed");

        supply = await WIT.totalSupply.call();
        assert.equal(supply.toNumber(), 2, "WIT creation failed");

        afterBalance = await web3.eth.getBalance(WIT.address);
        assert(afterBalance - ethAsk == beforeBalance, "Eth was not taken from accepter properly");

        owner = await WIT.ownerOf(2);
        assert.equal(accepterAccount, owner, "Second WIT was not transferred to accepter");


}

*/





	
