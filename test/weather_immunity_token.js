var WeatherImmunityToken = artifacts.require("WeatherImmunityToken");
var expect = require('expect');

contract('WeatherImmunityToken', function(accounts) {
 /* it("Should create a token, transfer it to the creator, and increment totalSupply.", function(){
    return WeatherImmunityToken.deployed().then(function(instance) {
      WIT = instance;
      console.log(accounts[0]);
      return WIT.createWIT(0);
    }).then(function(){
      return WIT.totalSupply();
    }).then(function(supply){
    	assert.equal(supply, 1, "totalSupply was not incremented.");
        return WIT.ownerOf.call(1);
    }).then(function(owner){
    	assert.equal(owner, accounts[0], "Token was not transferred to it's creator.");
    });
  });*/
  it("Should create two tokens, transfer them to the creators, and make the tokens partners", function(){
    return WeatherImmunityToken.deployed().then(function(instance) {
    	WIT = instance;
    	return WIT.createWIT(0, {from: accounts[0]});
    }).then(function(){
    	return WIT.createWIT(1, {from: accounts[1]});
    }).then(function(){
        return WIT.ownerOf.call(1);
    }).then(function(owner){
    	assert.equal(owner, accounts[0], "1st token was not transferred to 1st account");
    	return WIT.ownerOf.call(2);
    }).then(function(owner){
    	assert.equal(owner, accounts[1], "2nd token was not transferred to 2nd account");
    	return WIT.partnerOf.call(1);
    }).then(function(partner){
    	assert.equal(partner.toNumber(), 2, "2nd token is not the partner of 1st");
    	return WIT.partnerOf.call(2);
    }).then(function(partner){
    	assert.equal(partner.toNumber(), 1, "1st token is not the partner of 2nd");
        return WIT.createWIT(1, {from: accounts[2]});
    }).then(function(){
    	return WIT.partnerOf.call(3);
    }).then(function(partner){
        assert.notEqual(partner.toNumber(), 1, "Illegal partnership created");
        return WIT.balanceOf(accounts[2]);
    }).then(function(balance){
    	assert.equal(balance, 0, "Illegal token created");
    });
  });


});
