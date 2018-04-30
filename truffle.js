module.exports = {
   networks: {
   development: {
   host: "127.0.0.1",
   port: 8545,
   network_id: "*",
   gas: 6400000, // Match any network id
   from: "0xf17f52151ebef6c7334fad080c5704d77216b732"
  },
   ropsten: {
   host: "127.0.0.1",
   port: 8545,
   network_id: "3",
   gas: 6400000,
   from: "0x6c30aA95a795D77591c35e83e086BA6Bb96De26d"
  }
 }
};
