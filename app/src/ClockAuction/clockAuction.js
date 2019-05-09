import React, {useState, useEffect } from "react";
import ClockAuction from "../contracts/ClockAuction.json";
import getWeb3 from "../utils/getWeb3";
import Web3 from "web3"


const getClockAuction =
  new Promise((resolve,reject) => {
    getWeb3.then(async (web3) => {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = await ClockAuction.networks[networkId];
      const instance = await new web3.eth.Contract(
        ClockAuction.abi,
        deployedNetwork && deployedNetwork.address,
      );
      resolve(instance);
    })
  })

export default getClockAuction;
