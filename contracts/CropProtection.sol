pragma solidity ^0.4.16;

/// @title The Crop Protection Dapp.
contract CropProtection {
//A Protection Agreement, which represents an agerement
//between buyer and seller to protect a crop.
    struct Agreement {
        address buyer; //the farmer
        address seller; //the financeer
        uint protection; //amount of wei to cover the crop
        uint cost; //amount of wei to be paid to the seller
    }
    
    // A dynamically-sized array of `Agreement` structs.
    Agreement[] public agreements;

    //the system fee in parts per million (10000 = 1%)
    uint public systemFeePPM = 10000;
    
    function getAgreement(uint index) public constant returns (address, address, uint, uint) {
        return (agreements[index].buyer, agreements[index].seller, agreements[index].protection, agreements[index].cost);
    }

    function createAgreement(address _buyer, address _seller, uint _protection, uint _cost) public returns (uint){
        Agreement memory a = Agreement(_buyer, _seller, _protection, _cost);
        agreements.push(a);
    }

}

