const MemeMerchant = artifacts.require("MemeCore");
const ClockAuction = artifacts.require("ClockAuction");
const ComplexStorage = artifacts.require("ComplexStorage");

module.exports = function(deployer) {
  deployer.deploy(MemeMerchant).then(function() {
    return deployer.deploy(ClockAuction, MemeMerchant.address, 250);
  });

};
