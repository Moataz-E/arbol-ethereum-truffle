module.exports = {
   networks: {
   development: {
   host: "127.0.0.1",
   port: 8545,
   network_id: "*",
   gas: 6400000 // Match any network id
  },
   rinkeby: {
   host: "127.0.0.1",
   port: 8545,
   network_id: "4",
   gas: 6400000
  },
  mainnet: {
   host: "127.0.0.1",
   port: 8545,
   network_id: "1",
   gas: 6400000
 }
 }
};
