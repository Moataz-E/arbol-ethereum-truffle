The Arbol ÐApp
============================

Quick Start
-------------------------

Install truffle globally on your computer.

    $ sudo npm install -g truffle

Install ganache-cli on your computer. The GUI version of Ganache will sadly no longer work for our purposes, as it lacks a feature that is necessary for ethereum bridge (unlocking accounts).

    $ sudo npm install -g ganache-cli

Clone this repo (if you haven't already) and install node packages.

    $ git clone https://github.com/bandrebandrebandre/crop-dapp.git
    $ cd crop-dapp
    $ npm install

We need to install ethereum bridge, which lets us make calls to Oraclize from our testing environment.

Install etherem bridge. Don't do this inside the crop-dapp directory.

    $ git clone https://github.com/oraclize/ethereum-bridge.git
    $ cd ethereum-bridge
    $ npm install

Ethereum bridge (soon to be replaced by Stargate) needs an older version of node. 

Install node version manager (nvm) using the instructions on this page: https://github.com/creationix/nvm/blob/master/README.md

Make sure the latest version of node is installed.

    $ nvm install node

Start ganache-cli with latest node version (9.x as of this writing).

    $ nvm use node
    $ ganache-cli --unlock 0 --unlock 1 --unlock 3 --deterministic --mnemonic "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"

Open a new terminal window, move to your ethereum bridge directory, and start ethereum bridge with node 6.9.1. It takes a while to finish starting.

    $ nvm install 6.9.1
    $ cd ethereum-bridge
    $ nvm use 6.9.1
    $ node bridge -H 127.0.0.1:8545 -a 1 --dev

Open a third terminal window and run the truffle tests in the crop-dapp directory with node 9.x

    $ cd crop-dapp
    $ nvm use node
    $ truffle test

Interact with the application via Truffle console or via a front end application.

    $ cd crop-dapp
    $ nvm use node
    $ truffle deploy

Deploying to Rinkeby
-------------------------

We currently use Rinkeby as a public testnet, as Ropsten has a prohibitive gas limit. 

Create a Rinkeby account in Metamask or elsewhere.

Follow the instructions on this page to get Ether: https://faucet.rinkeby.io/ (post your new wallet address to Google plus, then past the URL of the post into the faucet and select 18.75 Ether).

Install geth. See: https://github.com/ethereum/go-ethereum/wiki/Installing-Geth

Download the entire Rinkeby blockchain:

    $ geth --rinkeby --fast --cache=1024 --rpc --rpcapi db,eth,net,web3,personal

This will take about an hour, depending on your connection speed. If you use the --fast flag, then if you exit before it completes, you will not save any progress and will have to start fresh on your next attempt.

Once this has completed, start the geth console:

    $ geth attach http://127.0.0.1:8545

Check your account balance:

    $ web3.fromWei(eth.getBalance(eth.accounts[2]), "ether")

Unlock your account for an hour:

    $ personal.unlockAccount(eth.accounts[2], "password", 3600)
    
Deploy to rinkeby:

    $ truffle migrate --network rinkeby
