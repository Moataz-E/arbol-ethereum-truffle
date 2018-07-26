var DONUT = artifacts.require("./EternalDonut.sol");	
var ARBOL = artifacts.require("./Arbolcoin.sol");

module.exports = function(deployer, network, accounts) {

    if (network == "development") {
    	var deployer_account = accounts[1]
    } else {
        if (network == "rinkeby") {
            var deployer_account = "0x2b8d009b7b256d82a5d3ea679631b69e0d1babeb"
        }	
        if (network == "ropsten") {
            var deployer_account = "0x2485be30c6091a7a3f715e53a1cd071db33cf20c"
        }
    }


    deployer.deploy(DONUT, {from: deployer_account}).then(function() {
    	DONUT.deployed().then(function(A_DONUT) {
        	deployer.deploy(ARBOL, A_DONUT.address, {from:deployer_account}).then(function() {
				ARBOL.deployed().then(function(AN_ARBOL) {
					A_DONUT.grantAuthorization(AN_ARBOL.address, {from: deployer_account});
				})
			})
//            console.log("A_DONUT.address: ", A_DONUT.address);
		})
    })
}


