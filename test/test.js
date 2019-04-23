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
    await console.log("set1");

  }

  // bootstrap marketplace with legacy memes (Generation before user upload)
  async function bootstrapMarket(){
    console.log("set2")
    let address = coreC.address
    coreC.createLegacyAuction( 1, {from: mmCOO})
    //await coreC.createMeme(address, address, 1)
    console.log("set1");
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


  describe('first meme-load',  function(){
    before(bootstrapMarket)
    it('should have a meme', async function(){
      let memeGeneration = await coreC.getMeme(0);
      await console.log(memeGeneration.generation.toNumber() + "the");

      assert.equal(memeGeneration.generation.toNumber(), 1);
      })
    })
});
