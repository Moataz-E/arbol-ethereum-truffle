pragma solidity ^0.4.18;

import './Ownable.sol';

contract AccessControlled is Ownable {

    mapping(address => bool) private authorizationList;

    event ClientAuthorizationGranted(address indexed newClient);
    event ClientAuthorizationRevoked(address indexed formerClient);

    modifier requiresAuthorization {
      require(authorizationList[msg.sender] == true);
      _;
    }

    function grantAuthorization(address client) onlyOwner public {
        require(authorizationList[client] == false);
        authorizationList[client] = true;
        ClientAuthorizationGranted(client);
    }    
  

    function revokeAuthorization(address client) onlyOwner public {
        require(authorizationList[client] == true);
        authorizationList[client] = false;
        ClientAuthorizationRevoked(client);
    }

}