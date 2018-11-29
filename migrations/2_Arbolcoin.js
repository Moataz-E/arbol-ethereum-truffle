var ARBOL = artifacts.require("./Arbolcoin.sol");

module.exports = function(deployer, network, accounts) {

	switch(network) {
		case "development":
	    	var deployer_account = accounts[1];
	    	break;
	    case "rinkeby":
	        var deployer_account = "0x2b8d009b7b256d82a5d3ea679631b69e0d1babeb";
	        break;
	    case "ropsten":
	    	var deployer_account = accounts[1];
	    	break;
	    case "mainnet":
	    	var deployer_account = accounts[0];
	}

    deployer.deploy(ARBOL, {from: deployer_account})
}

