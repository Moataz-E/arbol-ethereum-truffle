pragma solidity 0.4.24;

import './Ownable.sol';

contract EternalDonut is Ownable {

    mapping(bytes32 => uint) UIntStorage;

    function getUIntValue(bytes32 record) constant public returns (uint) {
        return UIntStorage[record];
    }

    function setUIntValue(bytes32 record, uint value) public
    onlyContractOwner {
        UIntStorage[record] = value;
    }

    mapping(bytes32 => string) StringStorage;

    function getStringValue(bytes32 record) constant public returns (string) {
        return StringStorage[record];
    }

    function setStringValue(bytes32 record, string value) public
    onlyContractOwner {
        StringStorage[record] = value;
    }

    mapping(bytes32 => address) AddressStorage;

    function getAddressValue(bytes32 record) constant public returns (address) {
        return AddressStorage[record];
    }

    function setAddressValue(bytes32 record, address value) public
    onlyContractOwner {
        AddressStorage[record] = value;
    }

    mapping(bytes32 => bytes32) Bytes32Storage;

    function getBytes32Value(bytes32 record) constant public returns (bytes32) {
        return Bytes32Storage[record];
    }

    function setBytes32Value(bytes32 record, bytes32 value) public
    onlyContractOwner {
        Bytes32Storage[record] = value;
    }

    mapping(bytes32 => bytes) BytesStorage;

    function getBytesValue(bytes32 record) constant public returns (bytes) {
        return BytesStorage[record];
    }

    function setBytesValue(bytes32 record, bytes value) public 
    onlyContractOwner {
        BytesStorage[record] = value;
    }

    mapping(bytes32 => bool) BooleanStorage;

    function getBooleanValue(bytes32 record) constant public returns (bool) {
        return BooleanStorage[record];
    }

    function setBooleanValue(bytes32 record, bool value) public
    onlyContractOwner {
        BooleanStorage[record] = value;
    }
    
    mapping(bytes32 => int) IntStorage;

    function getIntValue(bytes32 record) constant public returns (int) {
        return IntStorage[record];
    }

    function setIntValue(bytes32 record, int value) public
    onlyContractOwner {
        IntStorage[record] = value;
    }

}