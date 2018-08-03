let BN = require('bn.js');
let BigNumber = require('bignumber.js');

module.exports = {
  numStringToBytes32: function(num) {
    var bn = new BN(num).toTwos(256);
    return padToBytes32(bn.toString(16));
  },
  bytes32ToNumString: function(bytes32str) {
    bytes32str = bytes32str.replace(/^0x/, '');
    var bn = new BN(bytes32str, 16).fromTwos(256);
    return bn.toString();
  },
  sleep: function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


function padToBytes32(n) {
    while (n.length < 64) {
        n = "0" + n;
    }
    return "0x" + n;
}