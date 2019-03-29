pragma solidity >=0.4.21 <0.6.0;

import "/openzeppelin-solidity/contracts/token/ERC721/ERC721Enumerable.sol";

contract TutorialToken is ERC721Enumerable{
    string public name = "TutorialToken";
    string public symbol = "TT";
    uint public decimals = 2;
    uint public INITIAL_SUPPLY = 12000;

    constructor() public {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
