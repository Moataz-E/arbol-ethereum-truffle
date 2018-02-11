Weather Immunity ÐApp
============================
-------------------------
Quick Start
-------------------------

If Node.js and NPM aren't installed already on your computer, install them using your web browser.

If they are installed, make sure you are using the latest version.

    $ sudo npm cache clean -f
    $ sudo npm install -g n
    $ sudo n stable


Install truffle globally on your computer.

    $ sudo npm install truffle -g

Install the local dependencies specified in package.json

    $ npm install

Install Ganache using your web browser. http://truffleframework.com/ganache/ Start Ganache and make sure the RPC server is configured to use HTTP://127.0.0.1:7545

Migrate smart contracts to Ganache using Truffle.

    $ truffle deploy

Interact with the application via Truffle console or via a front end application.

-----------------------
Testing
-----------------------

Run the tests.

    $ truffle test

