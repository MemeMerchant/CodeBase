 # Design Document: Refactoring Legacy Code for 2019 

This document is intended to look at the differences between solidity documentation from 2018 to 2019 and incorporating Open-Zeppelin's battle tested codeBase.

We agreed that we would utilize the battle tried Open-Zeppelin ERC721 & ERC721Enumerable contracts as our base contracts and build the proprietary MemeMerchant code around this base. This greatly simplifies the effort and increases confidence in both functionality and security of the contracts. Additionally, it streamlines testing efforts 

## Main Contract Additions 

 + Auction Contracts
 + Meme Structures 
 + Legacy Meme Marketplace Bootstrapping 
 + Distributed Meme Minting Procedures 

## Front End Considerations 

 + Fill in here 

## uPort Design Considerations
 
 + Fill in here 

## IPFS Data Management Considerations 

 + Fill in here
 
## Contract Tree structure 

 + Place tree here

## Merge Activity (Legacy code with Zeppelin)
Once we got all of the code to compile together, it needed to be edited for funcionality. The main concern is matching the memory and storage elements between the Zeppelin contracts and the legacy contracts to ensure that we don't have gaps in our token management. In MemeBase.sol, the majority of the functions are going to be replaced by the Zeppelin code. The funcitons which were not commented out are:
 
```solidity
//Checks if the caller owns the inputed meme
function _owns(address _calling, uint256 tokenId) 

function _resetApproval(address _owner, uint256 tokenId)

/// @dev Defines the new meme which has been created and adds it to the
/// meme array. By doing so, we also create the unique memeId.  When the
/// _transfer function is called to assign its initial ownership, we
/// use the memeId as the tokenId.
function createMeme(address _owner, address _creator, uint16 generation)
```
There were also several helper functions not commented out but that is only because they aren't called anywhere as the parent functions have been commented out. Its also true that the Zeppelin code has functions which perform the same as the `_resetApproval` and `_owns` functions. 

`MemeOwnerhsip.sol` was also all but entirely commented out to be replaced by the Zeppeling code. Only the supportsInterface functions weren't commented out in these cases.

All of the code from `MemeAuction.sol` -> `MemeCore.sol` remains the same aside from some edits to support the new solc compiler requirements. The focus needs to be on matching the existing memory management in these contracts with the new memory management that was replaced in `MemeBase.sol` and `MemeOwnership.sol`

On top of the ERC721 management, we will need to provide the infrastructure that applies the meme data to the token itself and the managment of that information on the contract. The remainder of the management is of the contracts and the auctions.  
