var DONUT = artifacts.require("./EternalDonut.sol");	
var WIT = artifacts.require("./WeatherImmunityToken.sol");
var ARBOL = artifacts.require("./Arbolcoin.sol");
var NOAA = artifacts.require("./NOAAPrecipAggregate.sol");


module.exports = function(deployer, network, accounts) {
    deployer.deploy([WIT,ARBOL,NOAA,DONUT]).then(function() {
			DONUT.deployed().then(function(A_DONUT){
				WIT.deployed().then(function(A_WIT){
					NOAA.deployed().then(function(A_NOAA){
						ARBOL.deployed().then(function(AN_ARBOL){
							A_DONUT.transferOwnership(A_WIT.address);
							A_WIT.initialize(AN_ARBOL.address, A_DONUT.address, A_NOAA.address);	    
							A_NOAA.transferOwnership(A_WIT.address);	 
							web3.eth.sendTransaction({from:accounts[0], to:A_NOAA.address, value:web3.toWei(5, "ether")}); // for oraclize callback.
						})
					})
				})
			})
		});
}