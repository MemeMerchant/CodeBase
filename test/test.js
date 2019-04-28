const MemeMerchant = artifacts.require("./MemeCore.sol");
const ClockAuction = artifacts.require("./Auction/ClockAuction.sol");
const truffleAssert = require('truffle-assertions');
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

  }


const increaseTime = function(duration) {
  const id = Date.now()

  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id: id,
    }, err1 => {
      if (err1) return reject(err1)

      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id+1,
      }, (err2, res) => {
        return err2 ? reject(err2) : resolve(res)
      })
    })
  })
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
    it('should be selling at aggreed upon initial legacy price until purchases (100 finney)', async function(){
      let currentPrice = await auctionC.getCurrentPrice(24);
      let res = await web3.utils.fromWei(currentPrice, "finney");
      assert.isAbove(parseInt(res), 95);
    });
  });

  describe('bid on legacy auctions', function(){
    // no before, already bootstrapped0
    it('should allow purchase on auction meme0', async function(){
      let currentPrice = await auctionC.getCurrentPrice(0);
      let buyer = memer1;
      await auctionC.bid(
        0,
        {
          value: currentPrice,
          from: buyer
        }
      );
      let meme = await coreC.getMeme(0);
      let owner = await meme.owner;
      assert.equal(owner, memer1);
    });
    it('should allow purchase on auction meme1', async function(){
      let currentPrice = await auctionC.getCurrentPrice(1);
      let buyer = memer2;
      await auctionC.bid(
        1,
        {
          value: currentPrice,
          from: buyer
        }
      );
      let meme = await coreC.getMeme(1);
      let owner = await meme.owner;
      assert.equal(owner, memer2);
    });
    it('should allow purchase on auction meme2', async function(){
      let currentPrice = await auctionC.getCurrentPrice(2);
      let buyer = memer3;
      await auctionC.bid(
        2,
        {
          value: currentPrice,
          from: buyer
        }
      );
      let meme = await coreC.getMeme(2);
      let owner = await meme.owner;
      assert.equal(owner, memer3);
    });
    it('should prevent bidding if it has already been purchased', async function(){
      let buyer = memer1;
      let bid = web3.utils.toWei('100', "finney");
      await truffleAssert.reverts(auctionC.bid(
        2,
        {
          value: bid, // set to starting cost so we know this won't fail
          from: buyer,
        }
      ));
    });


    it('should fail if insufficient funds are sent', async function(){
      let currentPrice = await auctionC.getCurrentPrice(3);
      let bid = currentPrice - web3.utils.toWei('50', "finney");
      let buyer = memer3;
      await truffleAssert.reverts(auctionC.bid(
          3,
          {
            value: bid,
            from: buyer,
          }),
        );
    });
    it('should still be owned by MemeMerchant contract after failed bid', async function(){
      let auction = await auctionC.getAuction(3);
      let address = coreC.address;
      let result = auction.seller;
      assert.equal(result, address);
    });
    it('should allow cSuite to cancel legacy auction', async function(){
      await coreC.cancelAuctionFromMeme(4, {from: mmCEO});
      let auction = await auctionC.getAuction(4);
      let result = await auction.startedAt.toNumber();
      // if startedAt is equal to 0, the auction is no longer active
      assert.equal(result, 0);
    });
    it('should prevent bidding on auctions which arent live', async function(){
      await truffleAssert.reverts(auctionC.bid(
        4,
        {
          value: await web3.utils.toWei('100', "finney"), // the starting price so we know it is enough
          from: memer4, // hasn't transacted yet so we know has enough funds
        }
      ));
    });
    //it('should return change if extra funds were sent');

  });

  describe('ownership management', function(){
    // no before, meme's already owned
    it('should be owned after successful bid', async function(){
      let meme0 = await coreC.getMeme(0);
      let owner = await meme0.owner;
      let expected = memer1;
      assert.equal(owner, expected);
    });

    it('should allow auctioning of owned memes', async function(){
      let startingPrice = await web3.utils.toWei('100', 'finney');
      let endingPrice = 0;
      let duration = 1000; // measured in seconds
      await coreC.createClockAuction(
        0,
        startingPrice,
        endingPrice,
        duration,
        {
          from: memer1,
        }
      );
      let result = await auctionC.getAuction(0);
      assert.equal(result.seller , memer1);

    });
    it('shouldnt allow multiple auctions of same meme', async function(){
      let startingPrice = await web3.utils.toWei('100', 'finney');
      let endingPrice = 0;
      let duration = 1000; // measured in seconds
      await truffleAssert.reverts(coreC.createClockAuction(
        0,
        startingPrice,
        endingPrice,
        duration,
        {
          from: memer1,
        }
      ));
    });
    // prevent malicious memer5 from creating his own meme's for free, un-monitored
    it('should prevent creation of non-legacy bootstrapped memes', async function(){
      await assert.throws( function() {
        coreC.createMeme(
        memer5,
        memer5,
        1
      )})
    });
    it('should allow owner to cancel their auction', async function(){
      await coreC.cancelAuctionFromMeme(0, {from: memer1});
      let auction = await auctionC.getAuction(0);
      assert.equal(auction.startedAt, 0);
    });
    it('owner should still have ownership after canceling auction', async function(){
      let meme = await coreC.getMeme(0);
      let owner = meme.owner;
      let expected = memer1;
      assert.equal(owner, expected);
    })
    it('shouldnt allow a non-owner to cancel an auction', async function(){
      // attack through MemeMerchant contract
      await truffleAssert.reverts(coreC.cancelAuctionFromMeme(3, {from: memer5}));
      // attack through ClockAuction contract
      await truffleAssert.reverts(auctionC.cancelAuction(3, true, coreC.address));
    });
    it('should prevent auctions longer than 2 weeks', async function(){
      let startingPrice = await web3.utils.toWei('100', 'finney');
      let endingPrice = 0;
      let duration = 1209700; // 2weeks, 1 minute and 40 seconds in seconds
      await truffleAssert.reverts(coreC.createClockAuction(
        0,
        startingPrice,
        endingPrice,
        duration,
        {
          from: memer1,
        }
      ));
    });

    //it('should allow owner to "burn" meme to be reauctioned'); //may be future functionality

  });

  describe('c-suite functionality', function(){
    //note we have withdrawBalance and withdrawAuctionBalance
    //it('should allow CFO to withdraw funds from cut of auctions');
    afterEach(unpause);
    it('should allow the CFO to pause contracts', async function(){
      await coreC.pause({from: mmCFO});
      let paused = await coreC.paused({from:mmCFO});
      assert.equal(paused, true);
    });
    it('should allow the CEO to pause contracts', async function(){
      await coreC.pause({from: mmCEO});
      let paused = await coreC.paused({from:mmCEO});
      assert.equal(paused, true);
    });

    it('should allow COO to pause contracts', async function(){
      await coreC.pause({from: mmCOO});
      let paused = await coreC.paused({from:mmCOO});
      assert.equal(paused, true);
    });

  });

  describe('general contract functionality',function(){
    it('shouldnt accept fallback funds unless its from the clockAuction', async function(){
      await truffleAssert.reverts(
        coreC.sendTransaction({from:memer5, value: web3.utils.toWei("1","ether")}));
    });
  })
  describe('fast-forward tests: have to go last', function(){

    it('should pull auction after the auction time has expired', async function(){
      // this covers both legacy memes and personal auction memes
      await coreC.createLegacyAuction(25,{from:mmCOO});
      await increaseTime(87500)
      let expired = await auctionC.getOnAuction(25);
      assert.equal(expired , false);
      // PENDING STILL NEEDS TO BE IMPLEMENTED
      // USER THE EVM_INCREASETIME opcode
    });
  });


});
