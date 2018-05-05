module.exports = {
   networks: {
   development: {
   host: "127.0.0.1",
   port: 8545,
   network_id: "*",
   gas: 6400000, // Match any network id
   from: "0xf17f52151ebef6c7334fad080c5704d77216b732"
  },
   rinkeby: {
   host: "127.0.0.1",
   port: 8545,
   network_id: "4",
   gas: 6400000,
   from: "0x2B8d009b7b256d82A5d3ea679631B69e0D1Babeb"
  }
 }
};
