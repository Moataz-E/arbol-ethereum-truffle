pragma solidity 0.4.18;

import './Ownable.sol';

contract EternalDonut is Ownable {

    mapping(bytes32 => uint) UIntStorage;

    function getUIntValue(bytes32 record) constant returns (uint) {
        return UIntStorage[record];
    }

    function setUIntValue(bytes32 record, uint value)
    onlyContractOwner {
        UIntStorage[record] = value;
    }

    mapping(bytes32 => string) StringStorage;

    function getStringValue(bytes32 record) constant returns (string) {
        return StringStorage[record];
    }

    function setStringValue(bytes32 record, string value)
    onlyContractOwner {
        StringStorage[record] = value;
    }

    mapping(bytes32 => address) AddressStorage;

    function getAddressValue(bytes32 record) constant returns (address) {
        return AddressStorage[record];
    }

    function setAddressValue(bytes32 record, address value)
    onlyContractOwner {
        AddressStorage[record] = value;
    }

    mapping(bytes32 => bytes32) Bytes32Storage;

    function getBytes32Value(bytes32 record) constant returns (bytes32) {
        return Bytes32Storage[record];
    }

    function setBytes32Value(bytes32 record, bytes32 value)
    onlyContractOwner {
        Bytes32Storage[record] = value;
    }

    mapping(bytes32 => bytes) BytesStorage;

    function getBytesValue(bytes32 record) constant returns (bytes) {
        return BytesStorage[record];
    }

    function setBytesValue(bytes32 record, bytes value)
    onlyContractOwner {
        BytesStorage[record] = value;
    }

    mapping(bytes32 => bool) BooleanStorage;

    function getBooleanValue(bytes32 record) constant returns (bool) {
        return BooleanStorage[record];
    }

    function setBooleanValue(bytes32 record, bool value)
    onlyContractOwner {
        BooleanStorage[record] = value;
    }
    
    mapping(bytes32 => int) IntStorage;

    function getIntValue(bytes32 record) constant returns (int) {
        return IntStorage[record];
    }

    function setIntValue(bytes32 record, int value)
    onlyContractOwner {
        IntStorage[record] = value;
    }

}