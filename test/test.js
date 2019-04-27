const MemeMerchant = artifacts.require("./MemeCore.sol");
const ClockAuction = artifacts.require("./Auction/ClockAuction.sol");

var BigNumber = require('bignumber.js');

contract("MemeMerchant", function(accounts){
  const mmCEO = accounts[0];
  const mmCFO = accounts[1];
  const mmCOO = accounts[2];
  const memer1 = accounts[3];
  const memer2 = accounts[4];
  const memer3 = accounts[5];
  const memer4 = accounts[6];
  const memer5 = accounts[7];

  // Meme Core contracts
  let coreC;
  // ClockAuction contract
  let auctionC;

  async function deployContract(){
    coreC = await MemeMerchant.new();
    auctionC = await ClockAuction.new(coreC.address, 250);

    await coreC.unpause({from: mmCEO });

    await coreC.setClockAuctionAddress(auctionC.address, {from: mmCEO})

    await coreC.setCFO(mmCFO, {from: mmCEO});
    await coreC.setCOO(mmCOO, {from: mmCEO});

  }

  async function unpause(){
    await coreC.unpause({from:mmCEO});
  }

  // bootstrap marketplace with legacy memes (Generation before user upload)
  async function bootstrapMarket(){
    let address = await coreC.address
    let i = 0;
    while(i < 25){
      await coreC.createLegacyAuction(i,{from:mmCOO});
      await i++;
    }
    //coreC.createLegacyAuction( 1, {from: mmCOO})
  }

  before(deployContract);
  describe('initial state', function(){

    it('should be unpaused', async function(){
      let result = await coreC.paused({from: mmCEO});
      assert.equal(result, false);
    });

    it('should have a clockAuction address', async function(){
      let address = await auctionC.address;
      let result = await (address != 0 ? true : false);
      assert.equal(result, true);
    });
  });

  describe('market bootstrap',  function(){
    before(bootstrapMarket)
    it('should have the first meme', async function(){
      let meme0 = await coreC.getMeme(0);
      assert.equal(meme0.generation.toNumber(), 0);
    });
    it('should have the second meme', async function(){
      let meme1 = await coreC.getMeme(1);
      assert.equal(meme1.generation.toNumber(),1);
    });
    it('should have the third meme', async function(){
      let meme2 = await coreC.getMeme(2);
      assert.equal(meme2.generation.toNumber(),2);
    });
    it('should have the 25th meme', async function(){
      let meme24 = await coreC.getMeme(24);
      assert.equal(meme24.generation.toNumber(),24);
    });
    //Market now has 25 Meme's bootstrapped: This scales to any amount we want
    it('should be calculating next legacy price based on purchase');
    it('should be selling at aggreed upon initial legacy price until purchases');
  });

  describe('bid on legacy auctions', function(){
    // no before, already bootstrappedd
    it('should allow purchase on auction meme0');
    it('should allow purchase on auction meme1');
    it('should allow purchase on auction meme2');
    it('should pull auction after the auction time has expired'); // is this defined in code?
    it('should fail if insufficient funds are sent');
    it('should return change if extra funds were sent');
    it('should prevent bidding on auctions which arent live');
    it('should prevent bidding if it has already been purchased');
    it('should display list of available/open auctions');
  });

  describe('ownership management', function(){
    // no before, meme's already owned
    it('should be owned after successful bid');
    it('shouldnt be owned after failed bid');
    it('should allow auctioning of owned memes');
    it('shouldnt allow multiple auctions of same meme');
    it('should remove personal auction once auction expires');
    it('should prevent creation of non-legacy bootstrapped memes');
    it('should allow owner to cancel their auction');
    it('shouldnt allow a non-owner to cancel an auction');
    it('should prevent auctions longer than 2 weeks');
    it('should allow owner to "burn" meme to be reauctioned'); //may be future functionality

  });

  describe('c-suite functionality', function(){
    //note we have withdrawBalance and withdrawAuctionBalance
    it('should allow CFO to withdraw funds from cut of auctions');
    afterEach(unpause);
    it('should allow the CFO to pause contracts');
    it('should allow the CEO to pause contracts');
    it('should allow COO to pause contracts');

  });

  describe('general contract functionality',function(){
    it('shouldnt accept fallback funds unless its from the clockAuction');
  })

});
