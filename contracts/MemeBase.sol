pragma solidity >=0.4.21 < 0.6.0;

/// @title The MemeBase contract holds the fundamental events, structs, and variables
/// which are used throughout the MemeMerchant contract

import "/openzeppelin-solidity/contracts/token/ERC721/ERC721Enumerable.sol";
import "./MemeAccessControl.sol";
//import "./Strings/Strings.sol";


contract MemeBase is MemeAccessControl,ERC721Enumerable{


      /// @dev The meme struct is very simple due to the simple nature of MemeMerchant.
      /// We want to be able to track it's age and when it was created yet we don't
      /// need any other information stored in the meme struct and don't want to
      /// because every meme in existence will need to store this info on the blockchain
      /// Because of it's simplicity, it will all fit within one 256-bit word.
      /// @param creator: used to define who created the meme. Initially, all meme's
      /// creator address will be that of the contract used for the IMO, however in
      /// the future when we enable user upload, MemeMerchant can serve as a proxy,
      /// if accepted by the community, to attribute the actual creation of meme's
      /// to specific individuals.
      struct Meme {
        // while not currently implemented in our system, we need this param for
        // future to attribute content to individuals (large potential value add)
        address creator;
        uint64 birthTime;
        uint16 generation;
      }

      /// @dev An array of Meme's. This array keeps track and stores every Meme
      /// struct that is ever created. The ID's for each meme are in fact their
      /// index used to locate the meme in the memes array. Need this array as
      /// the allTokens array only stores token Id's for enumeration.
      Meme[] memes;

      /*********************************************/
      /*** Transfer Functions working w/ ERC721s ***/
      /*********************************************/


      /*********************************************/
      /** Add New Meme to the MemeMerchant System **/
      /*********************************************/

      /// @dev Defines the new meme which has been created and adds it to the
      /// meme array. By doing so, we also create the unique memeId.  When the
      /// _transfer function is called to assign its initial ownership, we
      /// use the memeId as the tokenId.
      function createMeme(address _owner,address _creator,uint16 _generation) internal returns(uint){
        Meme memory _meme = Meme({
          creator: _creator,
          birthTime: uint64(now),
          generation: _generation
          });
          
              /*
              NEED TO SET THESE FUNCTIONS TO THE ONES FROM Zeppelin
              COMPILATION ERRORS WILL POINT TO BROKEN points
              */

          uint _createdMemeId = memes.push(_meme)-1;

          require(_createdMemeId < 429496729);

          // emit MemeCreated event
          emit MemeCreated(_createdMemeId, _owner, _creator);

          // call only _addToken because we don't need to reset approvals or
          // remove ownership from elsewhere since it doesn't have these yet
          _addToken(_owner, _createdMemeId);
          emit Transfer(address(0), _owner, _createdMemeId);

          return(_createdMemeId);
      }

      /*********************************************/
      /***  ERC721Metadata Compliance Functions   ***/
      /*********************************************/


      string public constant _name = "MemeMerchant";
      string public constant _symbol = "MM";
      string public tokenMetadataBaseURI = "https://api.mememerchant.com";

      function name() external pure returns (string memory){
        return _name;
      }

      function symbol() external pure returns (string memory){
        return _symbol;
      }

      /// @notice Not needed for compliance, its a helper function
      /// @dev Allows CEO to change the base URI if it were to change
      function changeBaseURI(string memory newURI) public onlyCEO() {
        tokenMetadataBaseURI = newURI;
      }


  }
