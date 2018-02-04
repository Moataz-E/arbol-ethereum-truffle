var CropProtection = artifacts.require("CropProtection");
var expect = require('expect');


contract('CropProtection', function(createAgreement) {
  it("should create an agreement", function() {
    return CropProtection.deployed().then(function(instance) {
      return instance.createAgreement.sendTransaction("0xf17f52151ebef6c7334fad080c5704d77216b732", "0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef", 10000, 1000);
    }).then(function(transactionHash) {
      assert.equal(web3.eth.getTransactionReceipt(transactionHash).status, 1, "transaction hash not found on blockchain");
    });
  });


  it("should return the agreement that was previously created", function() {
    return CropProtection.deployed().then(function(instance) {
      instance.createAgreement.sendTransaction("0xf17f52151ebef6c7334fad080c5704d77216b732", "0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef", 10000, 1000);
      return instance.getAgreement.call(1);
    }).then(function(agreement) {
      console.log(agreement[0].toString(), agreement[1].toString(), agreement[2].toNumber(), agreement[3].toNumber());
      assert.equal(agreement[0].toString(), "0xf17f52151ebef6c7334fad080c5704d77216b732", "buyer does not match");
      assert.equal(agreement[1].toString(), "0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef", "seller does not match");
      assert.equal(agreement[2].toNumber(), 10000, 'protection does not match');
      assert.equal(agreement[3].toNumber(), 1000, 'cost does not match');
    });
  });
});
