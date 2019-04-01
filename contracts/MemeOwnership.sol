pragma solidity >=0.4.21 < 0.6.0;

import "./MemeBase.sol";



/// @title MemeOwnership takes care of meme ownership and ERC721 compliance


contract MemeOwnership is MemeBase{

  /*********************************************/
  /* Helper Functions: ERC721 implementations  */
  /*********************************************/



  function implementsERC721() external pure returns (bool) {
      return true;
    }

  function _isContract(address addr) internal view returns (bool) {
    uint size;
    assembly {size := extcodesize(addr)}
    return size > 0;
  }

  /* USE ZEPPELIN CODE
  /// @dev Returns the number of memes that an address owns
  function balanceOf(address _owner) external view returns (uint256){
    return ownedMeme[_owner].length;
  }


  function transferFrom(address _from, address _to, uint256 _tokenId) external payable{
    require(_to != address(0));
    require(_owns(_from, _tokenId));

    _resetApprovalAndTransfer(_to, _from, _tokenId);
  }
*/

/* I THINK WE SHOULD USE THE ZEPPELIN TRANSFER FUNCTIONS IN THEIR ENTIRITY THEY ARE LIKELY
   MORE EFFECIENT AND SECURE THAN OURS.... AND I CAN'T HONESTLY POINT TO A DIFFERENCE.
  function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes memory data) public payable {
    require(_to != address(0));
    require(_approvedFor(msg.sender, _tokenId));
    require(_owns(_from, _tokenId));

    _resetApprovalAndTransfer(_to, _from, _tokenId);

    if(_isContract(_to)){
      bytes4 tokenReceiverResponse = ERC721TokenReceiver(_to).onERC721Received.gas(50000)(
          _from, _tokenId, data
        );
      require(tokenReceiverResponse == bytes4 (keccak256("onERC721Received(address,uint256,bytes)")));
    }
  }

  function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable {
    safeTransferFrom(_from, _to, _tokenId, "");
  }

  */

/* Using Zeppelin Code
  function approve(address _approved, uint256 _tokenId) external payable {
    require(_owns(msg.sender, _tokenId));
    address owner = memeIdToOwner[_tokenId];
    require(_approved != owner);

    if(getApproved(_tokenId) != address(0) || _approved != address(0)){
      _approve(_approved, _tokenId);
      emit Approval(msg.sender, _approved, _tokenId);
    }
  }
*/

  function supportsInterface(bytes4 interfaceID) external view returns (bool)
    {
    return
      interfaceID == this.supportsInterface.selector || // ERC165
      interfaceID == 0x5b5e139f || // ERC721Metadata
      interfaceID == 0x6466353c || // ERC-721 on 3/7/2018
      interfaceID == 0x780e9d63; // ERC721Enumerable
    }
}
