pragma solidity 0.4.24;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721.sol';
import './SafeMath.sol';
import './EternalDonut.sol';

/**
 * @title DecoupledERC721Token
 * An implementation of the ERC721 token standard that uses a decoupled storage contract 
 * instead of keeping all data in this contract.
 */
contract DecoupledERC721Token is ERC721 {
    using SafeMath for uint256;

    // The storage contract
    EternalDonut internal storageContract;

    function totalSupply() public view returns (uint) {
        return storageContract.getUIntValue(keccak256("TotalSupply"));
    }

    function ownerOf(uint tokenID) public view returns (address) {
        address owner = storageContract.getAddressValue(keccak256("OwnerOf", tokenID));
        // require(owner != address(0));
        return owner;
    }

    function setOwnerOf(uint tokenID, address owner) private {    
        storageContract.setAddressValue(keccak256("OwnerOf", tokenID), owner);
    }

    /**
     * @dev Gets the approved address to take ownership of a given token ID
     * @param tokenID uint256 ID of the token to query the approval of
     * @return address currently approved to take ownership of the given token ID
     */
    function approvedFor(uint tokenID) private view returns (address) {
        return storageContract.getAddressValue(keccak256("ApprovedFor", tokenID));
    }

    function setTokenApproval(uint tokenID, address approvee) private {
        storageContract.setAddressValue(keccak256("ApprovedFor", tokenID), approvee);
    }

    /**
     * @dev Gets the balance of the specified address
     * @param owner address to query the balance of
     * @return uint256 representing the amount owned by the passed address
     */
    function balanceOf(address owner) public view returns (uint) {
        return storageContract.getUIntValue(keccak256("BalanceOf", owner));
    }

    /**
     * @dev Gets the list of tokens owned by a given address
     * @param owner address to query the tokens of
     * @return uint256[] representing the list of tokens owned by the passed address
     */
    function tokensOf(address owner) private view returns (uint[]) {
        uint balance = balanceOf(owner);    
        uint[] memory ownedTokens = new uint[](balance.sub(1));
        return ownedTokens;
    }

    /**
     * @dev Guarantees msg.sender is owner of the given token
     * @param _tokenId uint256 ID of the token to validate its ownership belongs to msg.sender
     */
    modifier onlyOwnerOf(uint256 _tokenId) {
        require(ownerOf(_tokenId) == msg.sender);
        _;
    }

    /**
     * @dev Transfers the ownership of a given token ID to another address
     * @param _to address to receive the ownership of the given token ID
     * @param _tokenId uint256 ID of the token to be transferred
     */
    function transfer(address _to, uint256 _tokenId) public onlyOwnerOf(_tokenId) {
        clearApprovalAndTransfer(msg.sender, _to, _tokenId);
    }

    /**
     * @dev Approves another address to claim for the ownership of the given token ID
     * @param _to address to be approved for the given token ID
     * @param _tokenId uint256 ID of the token to be approved
     */
    function approve(address _to, uint256 _tokenId) public onlyOwnerOf(_tokenId) {
        address owner = ownerOf(_tokenId);
        require(_to != owner);
        if (approvedFor(_tokenId) != 0 || _to != 0) {
            setTokenApproval(_tokenId, _to);
            Approval(owner, _to, _tokenId);
        }
    }

    /**
     * @dev Claims the ownership of a given token ID
     * @param _tokenId uint256 ID of the token being claimed by the msg.sender
     */
    function takeOwnership(uint256 _tokenId) public {
        require(isApprovedFor(msg.sender, _tokenId));
        clearApprovalAndTransfer(ownerOf(_tokenId), msg.sender, _tokenId);
    }

    /**
     * @dev Mint token function
     * @param _to The address that will own the minted token
     * @param _tokenId uint256 ID of the token to be minted by the msg.sender
     */
    function _mint(address _to, uint256 _tokenId) internal {
        require(_to != address(0));
        addToken(_to, _tokenId);
        Transfer(0x0, _to, _tokenId);
    }

    /**
     * @dev Burns a specific token
     * @param _tokenId uint256 ID of the token being burned by the msg.sender
     */
    function _burn(address owner, uint256 _tokenId) internal {
        if (approvedFor(_tokenId) != 0) {
            clearApproval(owner, _tokenId);
        }
        removeToken(owner, _tokenId);
        Transfer(owner, 0x0, _tokenId);
    }


    /**
     * @dev Tells whether the msg.sender is approved for the given token ID or not
     * This function is not private so it can be extended in further implementations like the operatable ERC721
     * @param _owner address of the owner to query the approval of
     * @param _tokenId uint256 ID of the token to query the approval of
     * @return bool whether the msg.sender is approved for the given token ID or not
     */
    function isApprovedFor(address _owner, uint256 _tokenId) internal view returns (bool) {
        return approvedFor(_tokenId) == _owner;
    }

    /**
     * @dev Internal function to clear current approval and transfer the ownership of a given token ID
     * @param _from address which you want to send tokens from
     * @param _to address which you want to transfer the token to
     * @param _tokenId uint256 ID of the token to be transferred
     */
    function clearApprovalAndTransfer(address _from, address _to, uint256 _tokenId) internal {
        require(_to != address(0));
        require(_to != ownerOf(_tokenId));
        require(ownerOf(_tokenId) == _from);
        clearApproval(_from, _tokenId);
        removeToken(_from, _tokenId);
        addToken(_to, _tokenId);
        Transfer(_from, _to, _tokenId);
    }

    /**
     * @dev Internal function to clear current approval of a given token ID
     * @param _tokenId uint256 ID of the token to be transferred
    */
    function clearApproval(address _owner, uint256 _tokenId) private {
        require(ownerOf(_tokenId) == _owner);
        setTokenApproval(_tokenId, 0);
        Approval(_owner, 0, _tokenId);
    }

    /**
     * @dev Internal function to add a token ID to the list of a given address
     * @param _to address representing the new owner of the given token ID
     * @param _tokenId uint256 ID of the token to be added to the tokens list of the given address
     */
    function addToken(address _to, uint256 _tokenId) private {
        require(ownerOf(_tokenId) == address(0));
        setOwnerOf(_tokenId, _to);
        storageContract.setUIntValue(keccak256("BalanceOf", _to), balanceOf(_to).add(1));
        storageContract.setUIntValue(keccak256("TotalSupply"), totalSupply().add(1));
    }

    /**
     * @dev Internal function to remove a token ID from the list of a given address
     * @param _from address representing the previous owner of the given token ID
     * @param _tokenId uint256 ID of the token to be removed from the tokens list of the given address
     */
    function removeToken(address _from, uint256 _tokenId) private {
        setOwnerOf(_tokenId, address(0));
        uint balance = balanceOf(_from);
 
        // decrement token balance of user.
        storageContract.setUIntValue(keccak256("BalanceOf", _from), balance.sub(1));
        storageContract.setUIntValue(keccak256("TotalSupply"), totalSupply().sub(1));
    }

}