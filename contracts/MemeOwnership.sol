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


  function supportsInterface(bytes4 interfaceID) external view returns (bool)
    {
    return
      interfaceID == this.supportsInterface.selector || // ERC165
      interfaceID == 0x5b5e139f || // ERC721Metadata
      interfaceID == 0x6466353c || // ERC-721 on 3/7/2018
      interfaceID == 0x780e9d63; // ERC721Enumerable
    }
}
