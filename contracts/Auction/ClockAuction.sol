pragma solidity >= 0.4.21 <0.6.0;

import "/openzeppelin-solidity/contracts/token/ERC721/ERC721Enumerable.sol";
import "./ClockAuctionBase.sol";

contract ClockAuction is ClockAuctionBase{
  /// @dev Constructor creates a reference to the NFT ownership contract
  /// and verifies the owner cut is in the valid range.
  /// @param _nftaddress -address of a deployed contract implementing
  /// the Nonfungible Interface

  bool public isClockAuction = true;
  address public owner;
  uint256 public legacyMemeCount;
  uint256[5] public lastLegacyMemeSalePrices;

  constructor(address _nftAddress, uint256 _cut) public{
    require(_cut <= 10000);
    owner = msg.sender;
    ownerCut = _cut;

    ERC721 candidateContract = ERC721(_nftAddress);
    // implements erc721 was part of the erc721 draft interface
    // this has been replaced by implementsInterface
    nonFungibleContract = candidateContract;
  }

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  function transferOwnership(address _newOwner) public{
    require(msg.sender == owner);
    require(_newOwner != address(0));
    emit OwnershipTransferred(msg.sender, _newOwner);
    owner = _newOwner;
  }

  /// @dev Transfers all ether from this contract, which is the owner's cuts (which
  /// is by default as the sellers cut is transfered away from this contract) as
  /// well as any ether sent directly to the contract address.
  /// Always transfers to the NFT contract which manages the auctions but can
  /// be called by either the contract or the owner.
  function withdrawBalance() external{
    address payable nftAddress = address(uint(address(nonFungibleContract)));

    require(
      msg.sender == owner ||
      msg.sender == nftAddress
      );
      nftAddress.transfer(address(this).balance);

  }

  function createAuction(
    uint256 _tokenId,
    uint256 _startingPrice,
    uint256 _endingPrice,
    uint64 _duration,
    address payable _seller
    )
    public
    canBeStoredwith128Bits(_startingPrice)
    canBeStoredwith128Bits(_endingPrice)
    canBeStoredwith64Bits(_duration)
    {
      require(msg.sender == address(nonFungibleContract));
      _escrow(msg.sender, _tokenId);
      Auction memory auction = Auction(
        _seller,
        uint128(_startingPrice),
        uint128(_endingPrice),
        uint64(_duration),
        uint64(now)
        );
        _addAuction(_tokenId, auction);
    }

    function bid(uint256 _tokenId)
    public
    payable
    {
      // _bid throws if the bid or funds transfer fails
      // price is defined in wei because msg.value returns the cost
      // in wei
      address seller = tokenIdToAuction[_tokenId].seller;
      uint256 price = _bid(_tokenId, msg.value);
      _transfer(msg.sender, _tokenId);

      if (seller == address(nonFungibleContract)){

        lastLegacyMemeSalePrices[legacyMemeCount % 5] = price;
        legacyMemeCount++;
      }
    }


    function cancelAuction(uint256 _tokenId) public {
      Auction storage auction = tokenIdToAuction[_tokenId];
      require(_isOnAuction(auction));
      address seller = auction.seller;
      require(msg.sender == seller);
      _cancelAuction(_tokenId, seller);
    }


    function cancelAuctionWhenPaused(uint256 _tokenId)
    // need to implement when paused somehow, not attached to access control
    public
    {
      require(msg.sender == owner);
      Auction storage auction = tokenIdToAuction[_tokenId];
      require(_isOnAuction(auction));
      _cancelAuction(_tokenId, auction.seller);
    }

    function getAuction(uint256 _tokenId)
      public
      view
      returns
    (
      address seller,
      uint256 startingPrice,
      uint256 endingPrice,
      uint256 duration,
      uint256 startedAt
    ){
      Auction storage auction = tokenIdToAuction[_tokenId];
      require(_isOnAuction(auction));
      return (
        auction.seller,
        auction.startingPrice,
        auction.endingPrice,
        auction.duration,
        auction.startTime
        );
    }

    function getCurrentPrice(uint256 _tokenId)
      public
      view
      returns (uint256)
    {
      Auction storage auction = tokenIdToAuction[_tokenId];
      require(_isOnAuction(auction));
      return _currentPrice(auction);
    }

    function averageLegacyMemePrice() public view returns (uint256) {
      uint256 sum = 0;
      for (uint128 i=0; i<5; i++){
        sum += lastLegacyMemeSalePrices[i];
      }
      return sum/5;
    }
}
