pragma solidity >=0.4.21 < 0.6.0;

/// @title The MemeBase contract holds the fundamental events, structs, and variables
/// which are used throughout the MemeMerchant contract

import "/openzeppelin-solidity/contracts/token/ERC721/ERC721Enumerable.sol";
import "./MemeAccessControl.sol";
//import "./Strings/Strings.sol";


contract MemeBase is MemeAccessControl,ERC721Enumerable{


    /*********************************************/
    /***            Event Definitions          ***/
    /*********************************************/

      /// @dev Alerts system that a new meme has entered the ecosystem
      /// @param memeId is the id of the meme, based of its index in the memes array
      /// @param memeOwner is the address of the first owner of the new memes
      /// in the initial implementation of the market the first owner will be the
      /// contract since it will be part of the IMO (initial meme offering)
      /// @param memeCreator allows for future lookups of an individual's meme creations
      /// Until user upload is implemented memeCreator will always be the IMO contract(s)
      /// and, in terms of the event, will be the same as the indexed memeOwner
      event MemeCreated(uint memeId, address indexed memeOwner, address indexed memeCreator);

      event Approval(address indexed _owner, address indexed _approved, uint256 _tokenId);
      /// @dev This is the event which is compliant with the ERC721 standard. Alerts
      /// the system to a transfer within the marketplace
      event Transfer(address indexed _from, address indexed _to, uint256 _tokenId);

      /*********************************************/
      /***          Storage Definitions          ***/
      /*********************************************/
      // includes the struct for memes, the array holding all memes and necessary mappings

      /// @dev The meme struct is very simple do to the simple nature of MemeMerchant.
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
      /// index used to locate the meme in the memes array.
      Meme[] memes;

      /// @dev mapping from the memeId to the address of the meme's owner.
      /// Every existing meme has a key pair in this mapping
      mapping (uint256 => address) public memeIdToOwner;


      /*** MAPPINGS UPDATE :
      **** Consider which mappings can utilize the ERC721Enumerable mappings for
      **** contract data-managemenet of tokens. Likely more efficient than the
      **** Mappings listed below. Consider if any of the below mappings provide
      **** a unique benefit. The Zeppelin enumerable contract was made after we
      **** we built the below and is meant to manage "discoverable" ERC721's
      **** which is what we were attempting to build below.
      ***/


  /*
      /// @dev mapping an address to the number of meme's that address owns
      mapping (address => uint256) public ownerMemeCount;
  */
      /// @dev mapping from an owner address to an array of the tokenId's which
      /// they own. Can replace the ownerMemeCount since ownedMeme[].length
      /// provides us with the number of tokens an address owns.
      mapping (address => uint256[]) public ownedMeme;
      //*** This is different than ERC721 template

      /// @dev In order to maintain the above array and the location we can find
      /// memes, we need a mapping which provides the location of the meme within
      /// the ownedMeme array. Finding the meme could be acheived via for loop
      /// but enacting a forloop every time a transaction is called or a meme is
      /// checked for approval is much more costly in the long run than the
      /// upfront cost of creating storage for the mapping.
      mapping(uint256 => uint256) private ownedMemeIndex;


      /// @dev mapping of the memeId to the address which has been approved to
      /// call transferFrom() to take ownership of the meme. If the value of the
      /// address is 0, it means that there are no outstanding approvals for that
      /// meme. At any given time, there can only be one address approved
      mapping (uint256 => address) public memeOwnerApproved;

      /// @dev Mapping from owner address to operator address to approval. Allows
      /// us to store the third parties which an owner approves to manage their memes
      mapping (address => mapping (address => bool)) private operatorApprovals;

      /*********************************************/
      /*** Transfer Functions working w/ ERC721s ***/
      /*********************************************/

      /// @dev Approvals for transfers are defined in the MemeOwnership Contract

      // count of all tokens in our database
      uint private allTokens;

      // checks if the caller owns the inputed meme
      function _owns(address _calling, uint256 tokenId) internal view returns(bool){
        return _calling == memeIdToOwner[tokenId];
      }


      function _resetApproval(address _owner, uint256 _tokenId) private {
        require(_owns(_owner, _tokenId));
        memeOwnerApproved[_tokenId] = address(0);
        emit Approval(_owner, address(0), _tokenId);
      }

      // transfers the meme and resets approval so that the new owner can set approvals
      function _resetApprovalAndTransfer(address _to, address _from, uint256 _tokenId) internal{
        require(_to != address(0));
        require(_to != memeIdToOwner[_tokenId]);
        require(_owns(_from, _tokenId));

        _resetApproval(_from, _tokenId);

        // not being created for the first time. KEEP EYE ON THIS
        // COULD CLASH WITH MINTING OR BECOME UNNCESSARY
        _removeToken(_from, _tokenId);
        _addToken(_to, _tokenId);
        emit Transfer(_from, _to, _tokenId);
      }

      function _removeToken(address _from,uint256 _tokenId) private {
        require(_owns(_from, _tokenId));

        uint256 tokenIndex = ownedMemeIndex[_tokenId];
        uint256 lastTokenIndex = ownedMeme[_from].length - 1;
        uint256 lastToken = ownedMeme[_from][lastTokenIndex];
        // this token is now onwed by no-one. Unless it is being burned, it must be
        // reassigned immediately after calling _removeToken
        memeIdToOwner[_tokenId] = address(0);
        //what was the last token in the owners array takes the spot of the removed token
        ownedMeme[_from][tokenIndex] = lastToken;
        ownedMeme[_from][lastTokenIndex] = 0;

        //Now need to reformat the array of memes this address owns
        ownedMeme[_from].length--;
        ownedMemeIndex[_tokenId] = 0;
        ownedMemeIndex[lastToken] = tokenIndex;
        allTokens--;
      }

      function _addToken(address _to,uint256 _tokenId) private {
        require(memeIdToOwner[_tokenId] == address(0));
        memeIdToOwner[_tokenId] = _to;

        uint256 length = ownedMeme[_to].length;
        ownedMeme[_to].push(_tokenId);
        ownedMemeIndex[_tokenId] = length;
        allTokens++;
      }


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

/*
      function tokenURI(uint256 _tokenId)
      external
      view
      returns (string memory infoUrl)
      {
      return Strings.strConcat(
        tokenMetadataBaseURI,
        Strings.uint2str(_tokenId));
      }
*/
      /// @notice Not needed for compliance, its a helper function
      /// @dev Allows CEO to change the base URI if it were to change
      function changeBaseURI(string memory newURI) public onlyCEO() {
        tokenMetadataBaseURI = newURI;
      }

      /*********************************************/
      /*** ERC721Enumerable Compliance Functions ***/
      /*********************************************/

      function totalSupply() public view returns(uint256) {
        return allTokens;
      }

  /*    COMMENT OUT: USE ZEPPELIN VERSION OF FUNCTION (in this case, its exactly the same)
        BE AWARE THAT ZEPPELIN USES "TOKEN" WE'VE USED MEME
      /// @dev Because the tokenId is equal to its Index in the meme[] list this
      /// function is simple. We only need to ensure that the index being searched
      /// for is less than the total supply of memes
      function tokenByIndex(uint256 _index) external view returns(uint256) {
        require(_index < totalSupply());
        return _index;
      }
    */

    /*  COMMENT OUT: USE ZEPPELIN VERSION OF FUNCTION (in this case, its exactly the same)
        BE AWARE THAT ZEPPELIN USES "TOKEN" WE'VE USED MEME

      function tokenOfOwnerByIndex(address _owner, uint256 _index)
      external
      view
      returns (uint256 _tokenId){
        require(_index < ownedMeme[_owner].length);
        return ownedMeme[_owner][_index];
      }
      */


      /* *************************** */
      /* Brought down from ownership */
      /* *************************** */

      function isApprovedForAll(address _owner, address _operator) public view returns (bool){
        return operatorApprovals[_owner][_operator];
      }


/*    USE ZEPPELIN VERSION OF FUNCTION (in this case, its exactly the same)
      BE AWARE THAT ZEPPELIN USES "TOKEN" WE'VE USED MEME

      /// @notice Enable or disable approval for a third party ("operator") to manage
      ///  all of `msg.sender`'s assets.
      /// @dev Emits the ApprovalForAll event
      /// @param _operator Address to add to the set of authorized operators.
      /// @param _approved True if the operators is approved, false to revoke approval
      function setApprovalForAll(address _operator, bool _approved) external{
        require(_operator != msg.sender);
        require(_operator != address(0));

        //Can both approve for all and revoke for all, don't need dif. functions
        operatorApprovals[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender,_operator,_approved);
      }
*/
      /// @dev Requires that the _tokenId is an NFT. It returns the approved
      /// address to transfer this function
      function getApproved(uint256 _tokenId) public view returns (address){
        require(_tokenId <= totalSupply());
        return(memeOwnerApproved[_tokenId]);
      }

      function _approve(address _approved, uint256 tokenId) internal {
        memeOwnerApproved[tokenId] = _approved;
      }
      /// @dev return the owner of the meme
      function ownerOf(uint256 _tokenId) public view returns (address){
        return memeIdToOwner[_tokenId];
      }

      function _approvedFor(uint256 tokenId) internal view returns(bool){
        return
           _owns(msg.sender, tokenId) ||
           isApprovedForAll(ownerOf(tokenId), msg.sender) ||
          _specificallyApprovedFor(msg.sender, tokenId);
      }

      function _specificallyApprovedFor(address _calling, uint256 tokenId) internal view returns(bool){
        return _calling == memeOwnerApproved[tokenId];
      }


  }
