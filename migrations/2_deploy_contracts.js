const MemeMerchant = artifacts.require("MemeCore");
const ClockAuction = artifacts.require("ClockAuction");


module.exports = function(deployer) {
  deployer.deploy(MemeMerchant).then(function() {
    return deployer.deploy(ClockAuction, MemeMerchant.address, 250);
  });
};
