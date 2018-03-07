var WeatherImmunityToken = artifacts.require("./WeatherImmunityToken.sol");
var Arbolcoin = artifacts.require("./Arbolcoin.sol");


module.exports = function(deployer) {
deployer.deploy(Arbolcoin).then(function() {
  return deployer.deploy(WeatherImmunityToken, Arbolcoin.address);
});

}
