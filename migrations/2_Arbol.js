var EternalDonut = artifacts.require("./EternalDonut.sol");	
var WeatherImmunityToken = artifacts.require("./WeatherImmunityToken.sol");
var Arbolcoin = artifacts.require("./Arbolcoin.sol");
var NOAAPrecipAggregate = artifacts.require("./NOAAPrecipAggregate.sol");

module.exports = function(deployer) {
deployer.deploy(EternalDonut);
deployer.deploy(Arbolcoin);
deployer.deploy(WeatherImmunityToken);
deployer.deploy(NOAAPrecipAggregate);

//await EternalDonutInstance.transferOwnership(WeatherImmunityTokenInstance.address);
//await WeatherImmunityTokenInstance.initialize(ArbolcoinInstance, EternalDonutInstance, NOAAPrecipAggregateInstance);

}
