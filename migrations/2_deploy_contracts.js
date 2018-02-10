var CropToken = artifacts.require("./CropToken.sol");
var WeatherImmunityToken = artifacts.require("./WeatherImmunityToken.sol");

module.exports = function(deployer) {
  deployer.deploy(CropToken);
  deployer.deploy(WeatherImmunityToken);
};
