var CropToken = artifacts.require("./CropToken.sol");

module.exports = function(deployer) {
  deployer.deploy(CropToken);
};
