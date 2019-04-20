  pragma solidity >= 0.4.21 <0.6.0;

import "./MemeMinting.sol";


/// @title MemeMerchant: Trade, collect, and create memes on the blockchain
/// @dev The core contract which contains all other contracts for MemeMerchant.

contract MemeCore is MemeMinting{

  address public newContractAddress;

  constructor() public {
    paused = true;

    ceoAddress = msg.sender;

    cooAddress = msg.sender;

  }

  function setNewAddress(address _nextAddress) public onlyCEO whenPaused{
    newContractAddress = _nextAddress;
    emit ContractUpgrade(newContractAddress);
  }

  function() external payable{
    require(
      msg.sender == address(clockAuction)
      );
  }

  function getMeme(uint256 _memeId)
    public
    view
    returns(
      address owner,
      address creator,
      uint16 generation,
      uint64 birthTime
      ){
        Meme storage _meme = memes[_memeId];
        owner = ownerOf(_memeId);
        creator = _meme.creator;
        generation = _meme.generation;
        birthTime = _meme.birthTime;
      }

   function unpause() public onlyCEO{
     require(address(clockAuction) != address(0));
     require(newContractAddress != address(0));

     super.unpause();
   }
}
