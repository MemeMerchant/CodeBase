pragma solidity >=0.4.21 <0.6.0;


import "/openzeppelin-solidity/contracts/token/ERC721/ERC721Enumerable.sol";

/// @title The base for an auction of an ERC721
/// @dev Containts models, variables and internal methods for the auction

contract ClockAuctionBase {

  /*******************************/
  /***         SETUP           ***/
  /*******************************/


  struct Auction{
    // address of the current meme owner
    address payable seller;
    // starting price of the dutch auction
    uint128 startingPrice;
    // end price of the dutch auction
    uint128 endingPrice;
    // length of the auction
    uint64 duration;
    // start time of the auction but = 0 if auction has concluded
    uint64 startTime;
  }



  ERC721 public nonFungibleContract;

  uint256 public ownerCut;

  // Mapping from token ID to their corresponding auction
  mapping (uint256 => Auction) tokenIdToAuction;

  /*******************************/
  /***    Events & Modifiers   ***/
  /*******************************/

  // events to notify of changes to auctions in our system
  event AuctionCreated(uint256 tokenId, uint256 startingPrice, uint256 endingPrice, uint256 duration);
  event AuctionSuccessful(uint256 tokenId, uint256 totalPrice, address winner);
  event AuctionCancelled(uint256 tokenId);

  /// @dev Empty fallback function. Don't want people sending money here
  function() external{}


  // check that inputs can be stored within a specified number of bits. Using
  // constants and modifiers saves gas
  modifier canBeStoredwith64Bits(uint256 _value){
    require(_value <= 18446744073709551615);
    _;
  }

  modifier canBeStoredwith128Bits(uint256 _value){
    require(_value <= 340282366920938463463374607431768211455);
    _;
  }

  /*******************************/
  /***       Functions         ***/
  /*******************************/

  /// @dev Returns true if the claimant owns the token
  function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
    return(nonFungibleContract.ownerOf(_tokenId) == _claimant);
  }

  /// @dev Escrows the NFT, assigning ownership to this contract.
  /// Throws if the escrow fails.
  /// @param _owner Current owner address of the token to escrow
  /// @param _tokenId ID of the token whose approval to verify.
  function _escrow(address _owner, uint256 _tokenId) internal{
    // will throw if transfer fails
    // if we want to use safeTransferFrom then we have to learn how to emit
    // the proper token receiver response
    nonFungibleContract.transferFrom(_owner, address(this), _tokenId);
  }

  /// @dev Transfers an NFT owned by this contract to another address.
  /// Emits transfer event
  function _transfer(address _receiver, uint256 _tokenId) internal {
    nonFungibleContract.transferFrom(address(this), _receiver, _tokenId);
  }

  /// @dev Adds an auction to the list of open MemeMerchant Auctions.
  /// Emits the AuctionCreated event.
  /// @param _auction Auction to add to the list
  function _addAuction(uint256 _tokenId, Auction memory _auction) internal{
    require(_auction.duration >= 1 minutes);

    tokenIdToAuction[_tokenId] = _auction;

    emit AuctionCreated(
      uint256(_tokenId),
      uint256(_auction.startingPrice),
      uint256(_auction.endingPrice),
      uint256(_auction.duration)
      );
  }

  /// @dev Cancels auction
  function _cancelAuction(uint256 _tokenId, address _seller) internal{
    _removeAuction(_tokenId);
    _transfer(_seller, _tokenId);
    emit AuctionCancelled(_tokenId);
  }

  /// @dev Computes the price of the meme and transfers the winnings to the seller
  /// @notice This function DOES NOT transfer ownership of token
  /// Emits the AuctionSuccessful event
  function _bid(uint256 _tokenId, uint256 _bidAmount) internal returns(uint256){
    Auction storage auction = tokenIdToAuction[_tokenId];

    // ensure that the auction is still currently in action
    require(_isOnAuction(auction));

    uint256 price = _currentPrice(auction);
    require(_bidAmount >= price);

    address payable seller = auction.seller;

    // at this point we have confirmed that the bid is good. We want to remove
    // the auction now to prevent a reentrancy attack.
    _removeAuction(_tokenId);

    // transfers proceeds (NOT TOKEN) to the seller
    if (price > 0){
      //also calculate the auctioneer's cut.
      // sellerProceeds is can't go negative because _computeCut() ensures
      // that it returns a value <= price;
      uint256 auctioneerCut = _computeCut(price);
      uint256 sellerProceeds = price - auctioneerCut;

      seller.transfer(sellerProceeds);
    }

    emit AuctionSuccessful(_tokenId, price, msg.sender);

    return price;
  }

  /// @dev Removes an auction from the list of open auctions.
  /// @param _tokenId - ID of NFT on auction.
  function _removeAuction(uint256 _tokenId) internal{
    delete tokenIdToAuction[_tokenId];
  }


  /// @dev Returns true if the NFT is on auction.
  function _isOnAuction(Auction storage _auction) internal view returns (bool){
    return (_auction.startTime >0);
  }

  /// @dev Returns the current price of the NFT on auction.
  /// Uses the compute current price function internally
  function _currentPrice(Auction storage _auction) internal view returns(uint256){
    uint256 secondsPassed = 0;

    if (now > _auction.startTime) {
      secondsPassed = now - _auction.startTime;
    }

    return _computeCurrentPrice(
      _auction.startingPrice,
      _auction.endingPrice,
      _auction.duration,
      secondsPassed
      );
  }

  /// @dev Computes the current price of the token at auction. This function
  /// is not part of _currentPrice() so that we can run unit tests.
  /// When we test, this function will be public
  function _computeCurrentPrice(
    uint256 _startingPrice,
    uint256 _endingPrice,
    uint256 _duration,
    uint256 _secondsPassed
    )
    internal
    pure
    returns (uint256)
    {

      // SafeMath isn't necessary here because all of the public Functions
      // set the maximum values for time at 64-bits and currency at 128-bits.
      // _duration is always non-zero due to the require() statement in _addAuction()
      if(_secondsPassed >= _duration){
        // we are at the end of the decreasing period of the auction, just
        // return the end price.
        return _endingPrice;
      }else{
        int256 totalPriceChange = int256(_endingPrice) - int256(_startingPrice);

        int256 currentPriceChange = totalPriceChange * int256(_secondsPassed) / int256(_duration);

        int256 currentPrice = int256(_startingPrice) + currentPriceChange;

        return uint256(currentPrice);
      }
    }

    /// @dev Computes auction owner's cut of the sale.
    /// @param _price SalePrice of NFT
    function _computeCut(uint256 _price) internal view returns (uint256) {
      return _price * ownerCut /10000;
    }

}
