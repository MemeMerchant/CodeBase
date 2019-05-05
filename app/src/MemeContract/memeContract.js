import React, { Component, useState, useEffect } from "react";
import MemeCore from "../contracts/MemeCore.json";
import getWeb3 from "../utils/getWeb3";


async function getMemeContract(){

  async function fetchWeb3(){
    try {
      // Get network provider and web3 instance.
      const web3Inst = await getWeb3();

      // Get the contract instance.
      const networkId = await web3Inst.eth.net.getId();
      const deployedNetwork = await MemeCore.networks[networkId];
      const instance = await new web3Inst.eth.Contract(
        MemeCore.abi,
        deployedNetwork && deployedNetwork.address,
      );
      return(instance);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }

  const memer = await fetchWeb3();
  return(memer);
}


export default getMemeContract;
