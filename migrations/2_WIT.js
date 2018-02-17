var WeatherImmunityToken = artifacts.require("./WeatherImmunityToken.sol");
var CropToken = artifacts.require("./CropToken.sol");


module.exports = function(deployer) {
//  deployer.deploy(CropToken);
//  deployer.deploy(WeatherImmunityToken);

deployer.deploy(CropToken).then(function() {
  return deployer.deploy(WeatherImmunityToken, CropToken.address);
});

}
