var EternalDonut = artifacts.require("./EternalDonut.sol");	
var WeatherImmunityToken = artifacts.require("./WeatherImmunityToken.sol");
var Arbolcoin = artifacts.require("./Arbolcoin.sol");
var NOAAPrecipAggregate = artifacts.require("./NOAAPrecipAggregate.sol");

//For testnet

module.exports = function(deployer) {
	 deployer.deploy(EternalDonut);
	 deployer.deploy(Arbolcoin);
	 deployer.deploy(WeatherImmunityToken);
	 deployer.deploy(NOAAPrecipAggregate);
}


/*
//For ropsten

var richAccount = "0x627306090abab3a6e1400e9345bc60c78a8bef57";

module.exports = async function(deployer) {
	await deployer.deploy(EternalDonut);
	await deployer.deploy(Arbolcoin);
	await deployer.deploy(WeatherImmunityToken);
	await deployer.deploy(NOAAPrecipAggregate);

    let WIT = await WeatherImmunityToken.deployed();
	let ARBOL = await Arbolcoin.deployed();
	let DONUT = await EternalDonut.deployed();
	let NOAA = await NOAAPrecipAggregate.deployed();

    await DONUT.transferOwnership(WIT.address);
    await WIT.initialize(ARBOL.address, DONUT.address, NOAA.address);
    await NOAA.transferOwnership(WIT.address);
    await web3.eth.sendTransaction({from:richAccount,to:NOAA.address, value:web3.toWei(5, "ether")}); // for oraclize callback.

}

*/
