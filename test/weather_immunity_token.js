var WeatherImmunityToken = artifacts.require("WeatherImmunityToken");
var expect = require('expect');

contract('WeatherImmunityToken', function(accounts) {
  it("Should create a token, transfer it to the creator, and increment totalSupply.", function(){
    return WeatherImmunityToken.deployed().then(function(instance) {
      WIT = instance;
      return WIT.CreateToken();
    }).then(function(){
      return WIT.totalSupply();
    }).then(function(supply){
    	assert.equal(supply, 1, "totalSupply was not incremented.");
        return WIT.ownerOf.call(0);
    }).then(function(owner){
    	assert.equal(owner, accounts[0], "Token was not transferred to it's creator.");
    });
  });
});