var DONUT = artifacts.require("./EternalDonut.sol");	
var WIT = artifacts.require("./WeatherImmunityToken.sol");
var ARBOL = artifacts.require("./Arbolcoin.sol");
var NOAA = artifacts.require("./NOAAPrecipAggregate.sol");
var NASA = artifacts.require("./NASACHIRPS.sol");

module.exports = function(deployer, network, accounts) {

	var deployer_account = "default"
	var arbolcoin_address = "default"

	switch(network) {
		case "development":
	    	deployer_account = accounts[1];
	    	ARBOL.deployed().then(function(AN_ARBOL) {
	    		arbolcoin_address = AN_ARBOL.address;
	    	});
	    	break;
	    case "rinkeby":
	        deployer_account = "0x2b8d009b7b256d82a5d3ea679631b69e0d1babeb";
	        break;
	    case "ropsten":
	    	deployer_account = accounts[1];
	    	break;
	    case "mainnet":
	    	deployer_account = accounts[0];
	}



    deployer.deploy([WIT,NOAA,NASA,DONUT], {from: deployer_account}).then(function() {
			DONUT.deployed().then(function(A_DONUT) {
				WIT.deployed().then(function(A_WIT) {
					NOAA.deployed().then(function(A_NOAA) {
					    NASA.deployed().then(function(A_NASA) {
							if (network == "development") {
							    A_NOAA.setLocalOAR();
							    A_NASA.setLocalOAR();
					    	}	    	
							A_DONUT.transferOwnership(A_WIT.address, {from: deployer_account});
							A_WIT.initialize(arbolcoin_address, A_DONUT.address, A_NOAA.address, {from: deployer_account});
							A_NOAA.transferOwnership(A_WIT.address, {from: deployer_account});
							A_NASA.transferOwnership(A_WIT.address, {from: deployer_account});
							web3.eth.sendTransaction({from: deployer_account, to: A_NOAA.address, value:web3.toWei(3, "ether")}); // for oraclize callback.
						})	
					})
				})
			})
		})

}


