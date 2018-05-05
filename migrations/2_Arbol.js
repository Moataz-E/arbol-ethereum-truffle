var DONUT = artifacts.require("./EternalDonut.sol");	
var WIT = artifacts.require("./WeatherImmunityToken.sol");
var ARBOL = artifacts.require("./Arbolcoin.sol");
var NOAA = artifacts.require("./NOAAPrecipAggregate.sol");

module.exports = function(deployer, network, accounts) {

    if (network == "development") {
    	var deployer_account = accounts[1]
    } else {
        if (network == "rinkeby") {
            var deployer_account = accounts[2]
        }	
    }

    deployer.deploy([WIT,ARBOL,NOAA,DONUT], {from: deployer_account}).then(function() {
			DONUT.deployed().then(function(A_DONUT) {
				WIT.deployed().then(function(A_WIT) {
					NOAA.deployed().then(function(A_NOAA) {
						ARBOL.deployed().then(function(AN_ARBOL) {
							A_DONUT.transferOwnership(A_WIT.address, {from: deployer_account});
							A_WIT.initialize(AN_ARBOL.address, A_DONUT.address, A_NOAA.address, {from: deployer_account});
							A_NOAA.transferOwnership(A_WIT.address, {from: deployer_account});
							web3.eth.sendTransaction({from: deployer_account, to: A_NOAA.address, value:web3.toWei(5, "ether")}); // for oraclize callback.
						})
					})
				})
			})
		});
}


