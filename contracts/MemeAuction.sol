pragma solidity >= 0.4.21 <0.6.0;
import "./MemeOwnership.sol";
import "./Auction/ClockAuctionBase.sol";
import "./Auction/ClockAuction.sol";

/// @title Crates auctions for the sale of memes.
/// @dev This contract allows users to create auctions with only one transaction

contract MemeAuction is MemeOwnership {

/* NEED TO BUILD:
  - +++++ address for contract handling the sale of memes
  - +++++ function to create the auction contract address (onlyCEO)
  - +++++ function to create an auction for a meme
    - calls the clockAuction contract 'createAuction' function
    - should check that the msg.sender owns the meme
    - need to approve the meme transfer (memeMerchant function)
    - need to create withdraw function to get the funds rom the sale auction
    - contract. 1 transfer call to the contract
  */


  /// @dev  This is the contract address which handles the actual auction of the
  /// meme.  The clockAuction contract holds the auction logic, not MemeAuction
  /// This external contract handles the P-P sales as well as the sale of legacy Memes
  ClockAuction public clockAuction;

  function setClockAuctionAddress(address _address) public onlyCEO{
    ClockAuction candidateContract = ClockAuction(_address);

    // confirm the set address is the auction we are looking for
    require(candidateContract.isClockAuction());

    // set the clock auction address
    clockAuction = candidateContract;
  }


  /// @dev creates auction at the clockAuction contract. That info originates
  /// within the meme merchant contrat
  /// add in time limit into auction logic 
  function createClockAuction(
    uint256 _memeId,
    uint128 _startingPrice,
    uint128 _endingPrice,
    uint64 _duration
    )
    public
    whenNotPaused()
  {
      require(ownerOf(_memeId) == msg.sender);
      approve(address(clockAuction), _memeId);

      clockAuction.createAuction(
        _memeId,
        _startingPrice,
        _endingPrice,
        _duration,
        msg.sender
        );
  }

  /// @dev Allows us to get our cut of the auction transactions from the
  /// contract hosting the auctions
  function withdrawAuctionBalance() external onlyCEO {
    clockAuction.withdrawBalance();
  }



}
