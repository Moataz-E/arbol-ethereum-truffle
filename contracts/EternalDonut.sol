pragma solidity ^0.4.18;

import './AccessControlled.sol';

contract EternalDonut is AccessControlled {

    mapping(bytes32 => uint) UIntStorage;

    function getUIntValue(bytes32 record) public view returns (uint) {
        return UIntStorage[record];
    }

    function setUIntValue(bytes32 record, uint value) public 
    requiresAuthorization {
        UIntStorage[record] = value;
    }

    mapping(bytes32 => string) StringStorage;

    function getStringValue(bytes32 record) public view returns (string) {
        return StringStorage[record];
    }

    function setStringValue(bytes32 record, string value) public 
    requiresAuthorization {
        StringStorage[record] = value;
    }

    mapping(bytes32 => address) AddressStorage;

    function getAddressValue(bytes32 record) public view returns (address) {
        return AddressStorage[record];
    }

    function setAddressValue(bytes32 record, address value) public 
    requiresAuthorization {
        AddressStorage[record] = value;
    }

    mapping(bytes32 => bytes32) Bytes32Storage;

    function getBytes32Value(bytes32 record) public view returns (bytes32) {
        return Bytes32Storage[record];
    }

    function setBytes32Value(bytes32 record, bytes32 value) public 
    requiresAuthorization {
        Bytes32Storage[record] = value;
    }

    mapping(bytes32 => bytes) BytesStorage;

    function getBytesValue(bytes32 record) public view returns (bytes) {
        return BytesStorage[record];
    }

    function setBytesValue(bytes32 record, bytes value) public 
    requiresAuthorization {
        BytesStorage[record] = value;
    }

    mapping(bytes32 => bool) BooleanStorage;

    function getBooleanValue(bytes32 record) public view returns (bool) {
        return BooleanStorage[record];
    }

    function setBooleanValue(bytes32 record, bool value) public 
    requiresAuthorization {
        BooleanStorage[record] = value;
    }
    
    mapping(bytes32 => int) IntStorage;

    function getIntValue(bytes32 record) public view returns (int) {
        return IntStorage[record];
    }

    function setIntValue(bytes32 record, int value) public
    requiresAuthorization {
        IntStorage[record] = value;
    }

}