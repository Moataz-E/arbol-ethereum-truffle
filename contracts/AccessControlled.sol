pragma solidity ^0.4.18;

import './Ownable.sol';

contract AccessControlled is Ownable {

    mapping(address => bool) private authorizationList;

    event ClientAuthorizationGranted(address indexed clientToBe);
    event ClientAuthorizationRevoked(address indexed clientToNoLongerBe);

    modifier requiresAuthorization {
      require(authorizationList[msg.sender] == true);
      _;
    }

    function grantAuthorization(address clientToBe) onlyOwner public {
        require(authorizationList[clientToBe] == false);
        authorizationList[clientToBe] = true;
        ClientAuthorizationGranted(clientToBe);
    }

    function revokeAuthorization(address clientToNoLongerBe) onlyOwner public {
        require(authorizationList[clientToNoLongerBe] == true);
        authorizationList[clientToNoLongerBe] = false;
        ClientAuthorizationRevoked(clientToNoLongerBe);
    }

    function isAuthorized(address client) public view returns (bool) {
        return authorizationList[client];
    }

}