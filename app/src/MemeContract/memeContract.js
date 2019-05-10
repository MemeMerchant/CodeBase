import React, { useState, useEffect } from "react";
import MemeCore from "../contracts/MemeCore.json";
import getWeb3 from "../utils/getWeb3";
import Web3 from "web3";

const getMemeContract =
  new Promise((resolve,reject) => {
       getWeb3.then( async (web3) => {
        const networkId =  await web3.eth.net.getId();
        const deployedNetwork =  await MemeCore.networks[networkId];
        const instance = await new web3.eth.Contract(
          MemeCore.abi,
          deployedNetwork && deployedNetwork.address,
        );
      resolve(instance);
    })
  });

export default getMemeContract;
