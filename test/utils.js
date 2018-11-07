var _ = require("lodash");
var Promise = require("bluebird");

function numStringToBytes32(num) { 
    var bn = new BN(num).toTwos(256);
   return padToBytes32(bn.toString(16));
}


function bytes32ToNumString(bytes32str) {
    bytes32str = bytes32str.replace(/^0x/, '');
    var bn = new BN(bytes32str, 16).fromTwos(256);
    return bn.toString();
}


function padToBytes32(n) {
    while (n.length < 64) {
        n = "0" + n;
    }
    return "0x" + n;
}


module.exports = {
    assertEvent: function(contract, filter) {
        return new Promise((resolve, reject) => {
            var event = contract[filter.event]();
            event.watch();
            event.get((error, logs) => {
               // console.log(logs[0].args);
                var log = _.filter(logs, filter);
                if ((log) && !_.isEmpty(log)) {
                    resolve(log);
                } else {
                    throw Error("Failed to find filtered event for " + filter.event);
                }
            });
            event.stopWatching();
        });
    },
    numStringToBytes32: function(num){
        return numStringToBytes32(num);
    },
    sleep: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    bytes32ToNumString: function(bytes32str) {
        return bytes32ToNumString(bytes32str);
    }
}