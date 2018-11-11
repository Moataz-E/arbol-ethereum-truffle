module.exports = function(callback) {

    //boilerplate script setup
	let Web3 = require('web3');
	const truffleContract = require('truffle-contract')
	let WITcontract = truffleContract(require('../build/contracts/WeatherImmunityToken.json'));
	let NASAcontract = truffleContract(require('../build/contracts/NASACHIRPS.json'));
	var provider = new Web3.providers.HttpProvider("http://localhost:8545");
	var web3 = new Web3(provider);
	WITcontract.setProvider(web3.currentProvider);
    NASAcontract.setProvider(web3.currentProvider)

		//workaround: https://github.com/trufflesuite/truffle-contract/issues/57
	if (typeof WITcontract.currentProvider.sendAsync !== "function") {
	    contract.currentProvider.sendAsync = function() {
	        return WITcontract.currentProvider.send.apply(
	              WITcontract.currentProvider, arguments
	        )};
	  	}
	if (typeof NASAcontract.currentProvider.sendAsync !== "function") {
	    contract.currentProvider.sendAsync = function() {
	        return NASAcontract.currentProvider.send.apply(
	              NASAcontract.currentProvider, arguments
	        )};
	  	}


	WITcontract.deployed().then(async function(WIT) {
		NASAcontract.deployed().then(async function(NASA) {


	        //vars for contract calls
			one_eth =       1000000000000000000;
			point_one_eth = 100000000000000000;
	    	NASAAddress = NASA.address;
	    	proposerAccount = "0x2b8d009b7b256d82a5d3ea679631b69e0d1babeb"; ///accounts[2]
	    	accepterAccount = "0x77e669bd35c0a5b1400655124d641bc855fa1a0e"; //accounts[3]
	    	evaluatorAccount = "0x2b8d009b7b256d82a5d3ea679631b69e0d1babeb";
	   //     proposerAccount = "0x627306090abab3a6e1400e9345bc60c78a8bef57";  //ganache addresses
	     //   accepterAccount = "0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef";
	       // evaluatorAccount = "0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef";

			let now = Math.round((new Date()).getTime() / 1000);  
			let one_month = 2592000;
			let one_year = 31622400;
			let one_month_from_now = now + one_month;
			let two_months_from_now = now + (2 * one_month);
			let one_year_ago = now - one_year;        

		    console.log("Creating proposal.");
	        response = await WIT.createWITProposal(point_one_eth, one_eth, false, NASAAddress, 10000, "21.5331234,-3.1621234&0.14255", one_year_ago, one_year_ago + one_month, false, {value: point_one_eth, from: proposerAccount, gas: 2000000});
		    console.log("Proposal response:");
		    console.log(JSON.stringify(response));


		    console.log("Creating acceptance.");
            try { proposalID = response.logs[0].args.WITID.toNumber(); }
    	    catch(err) { proposalID = response.logs.args.WITID.toNumber(); }
	        response = await WIT.createWITAcceptance(proposalID, {from: accepterAccount, value: one_eth, gas: 2000000});
	 	    console.log("Acceptance response: ");
		    console.log(JSON.stringify(response));

	        console.log("Evaluating WIT");
	        acceptanceID = response.logs[0].args.WITID.toNumber();
	        response = await WIT.evaluate(acceptanceID, "", {from: evaluatorAccount, gas: 2000000});
	        console.log("Evaluating response: ")
		    console.log(JSON.stringify(response));


        });
    });
}