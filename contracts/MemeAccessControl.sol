pragma solidity >=0.4.21 < 0.6.0;

/// @title Part of the MemeCore. Manages access methods for privileged functions
/// also manages the pause modifiers which control contract activity since pausing
/// is controlled by the roles defined in this contract
/// @dev Documentation on contract breakdown and arrangement is in the MemeCore contract
contract MemeAccessControl {
    // This piece of the core controls access for MemeMerchant.
    // There are 4 access controls composed of 3 roles defined below:
    //
    //  -CEO:Shaan
    //
    //
    //  -CFO:Eric
    //
    //
    //  -COO:Eric
    //
    //
    //
    // The current MemeMerchant team hasn't defined these roles due to company structure.
    // We are defining these access controls in case of a future structure which requires
    // a more complex access control system than simply "onlyOwner".

    /// @dev Fired when the contract is upgraded due to bug resolution
    event ContractUpgrade(address newContract);

    // Addresses of the accounts/contracts that are allowed access
    address public ceoAddress;
    address public cfoAddress;
    address public cooAddress;

    /// @dev Tracks if the contract is paused. If puased, most actions are blocked
    bool public paused = false;

    /***  Defining cSuite modifiers and functions ***/

    /// @dev Only the CEO is allowed access
    modifier onlyCEO() {
      require(msg.sender == ceoAddress);
      _;
    }

    /// @dev Only the CFO is allowed access
    modifier onlyCFO() {
      require(msg.sender == cfoAddress);
      _;
    }

    /// @dev Only the COO is allowed access
    modifier onlyCOO() {
      require(msg.sender == cooAddress);
      _;
    }

    /// @dev Only cSuite positions are allowed access
    modifier onlyCSuite() {
      require(
        msg.sender == ceoAddress ||
        msg.sender == cfoAddress ||
        msg.sender == cooAddress);
        _;
    }

    /*** Allows the cSuite positions to change addresses ***/

    /// @dev Changes the address associated with the CEO.
    /// @param _newCEO is the address of the new CEO of MemeMerchant
    function setCEO(address _newCEO) public onlyCEO {
      // address(0) is for deploying new contracts
      require(_newCEO != address(0));
      ceoAddress = _newCEO;
    }

    /// @dev Changes the address associated with the CFO
    /// @param _newCFO is the address of the new CFO of MemeMerchant
    function setCFO(address _newCFO) public onlyCEO {
      require(_newCFO != address(0));
      cfoAddress = _newCFO;
    }

    /// @dev Changes the address associated with the COO
    /// @param _newCOO is the address of the new COO of MemeMerchant
    function setCOO(address _newCOO) public onlyCEO {
      require(_newCOO != address(0));
      cooAddress = _newCOO;
    }

    /// @dev Allows the money within the contract to be withdrawn
    /// This is allocated to the role of the CFO #checksandbalances
    function withdrawBalance() external onlyCFO {
      msg.sender.transfer(address(this).balance);
    }

    /*** Define the puase functionality for our contracts ***/
    /// @dev Modified version of OpenZeppelin's Pausable to match Maat's accessibility
    /// Pausable is used as to enable emergency stops as well as safe upgrading of contracts
    event Pause();
    event Unpause();

    /// @dev The paused value is initialized as false when the contract is deployed

    modifier whenNotPaused {
      require(paused == false);
      _;
    }

    modifier whenPaused {
      require(paused == true);
      _;
    }

    /// @dev Can be called by any cSuite to control damage due to a bug
    function pause() onlyCSuite whenNotPaused public {
      paused = true;
      emit Pause();
    }

    /// @dev Only the CEO can unpause once the emergency has been resolved. This
    /// is to also maintain control if the CFO or COO address have been compromised.
    /// SECURITY RISK: If CEO loses access to account and the contract gets paused
    /// then all of the tokens will be locked in the contract.
    function unpause() whenPaused onlyCEO public{
      paused = false;
      emit Unpause();
    }
}
