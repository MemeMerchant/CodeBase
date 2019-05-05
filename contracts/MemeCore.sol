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

  /******************************************
  ****    Front End Getter Functions ********
  ******************************************/

  function getTotalMemes() public returns (uint){
    uint result = memes.length;
    return(result);
  }

  function isLegacyMeme(uint memeId) public returns (bool){
    address owner;
    address creator;
    uint16 generation;
    uint64 birthTime;
    (owner,creator,generation,birthTime) = getMeme(memeId);
    bool res;
    generation == 0 ? res = true : res = false;
    return(res);
  }

  // already have "onAuction" in the auction gontract, just need to deploys
  /* function OnAuctionMemes() public returns(uint[]){
    //return array of meme's currently on auction
  } */

}
