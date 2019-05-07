import React, {useState, useEffect } from "react";
import ClockAuction from "../contracts/ClockAuction.json";
import getWeb3 from "../utils/getWeb3";
import Web3 from "web3"


async function getClockAuction(){

  async function fetchWeb3(){
    try {
      // Get network provider and web3 instance.
      const web3Inst = await new Web3("ws://localhost:8545")

      // Get the contract instance.
      const networkId = await web3Inst.eth.net.getId();
      const deployedNetwork = await ClockAuction.networks[networkId];
      const instance = await new web3Inst.eth.Contract(
        ClockAuction.abi,
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

  const clockAuction = await fetchWeb3();
  return(clockAuction);
}


export default getClockAuction;
