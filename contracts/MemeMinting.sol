pragma solidity >=0.4.21 <0.6.0;

import "./MemeAuction.sol";

/// @dev Functions releated to creating new memes
contract MemeMinting is MemeAuction{

  uint128 legacyMemeStartingPrice = 10 finney;
  uint64 legacyMemeAuctionTime = 1 days;
  uint256 legacyCreatedCount;

  function createLegacyAuction(uint16 _generation) public onlyCOO{
    uint256 memeId = createMeme(address(this),address(0),_generation);
    //uint256 memeId = 1;
    approve(address(clockAuction), memeId);

    clockAuction.createAuction(
      memeId,
      _computeNextLegacyPrice(),
      0,
      legacyMemeAuctionTime,
      address(uint(address(this)))
      );

    legacyCreatedCount++;
  }


  function _computeNextLegacyPrice() internal view returns (uint256) {
        uint256 avePrice = clockAuction.averageLegacyMemePrice();

        // sanity check to ensure we don't overflow arithmetic (this big number is 2^128-1).
        require(avePrice < 340282366920938463463374607431768211455);

        uint256 nextPrice = avePrice + (avePrice / 2);

        // We never auction for less than starting price
        if (nextPrice < legacyMemeStartingPrice) {
            nextPrice = legacyMemeStartingPrice;
        }

        return nextPrice;
    }
}
