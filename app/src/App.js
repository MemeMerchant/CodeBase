import React, { Component } from "react";
import Body from "./Body/body.js";
import Web3 from 'web3';
import getClockAuction from "./ClockAuction/clockAuction.js";
import getMemeContract from "./MemeContract/memeContract.js";
import getWeb3 from "./utils/getWeb3.js";

import "./App.css";


class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      ceoAddress: 0,
      cooAddress: 0,
      web3: null,
      memeCore: 0,
      paused: false,
      clockAuction: 0,
      bootstrapped: false,
    }
  }

  componentDidMount = async() => {
      try{
        const web3 = await getWeb3;
        const accounts = await web3.eth.getAccounts();
        console.log(accounts);
        const memeContract = await getMemeContract;
        const paused = await memeContract.methods.paused().call();
        const clockAuction = await getClockAuction
        let bootstrapped, res;
          // bootstrapped = await memeContract.methods.getMeme(0).call();
        bootstrapped === null ? res = false : res = true;
        this.setState({
          memeCore: memeContract,
          paused: paused,
          bootstrapped: bootstrapped,
          clockAuction: clockAuction,
          web3: web3,
          ceoAddress: accounts[0],
          cooAddress: accounts[1],
        });

        console.log("Instantiated: " );
        console.log("  web3: " + this.state.web3)
        console.log("  paused: " + this.state.paused)
        console.log("  ceoAddress: " + this.state.ceoAddress)
        console.log("  cooAddress: " + this.state.cooAddress)
        console.log("  ClockAuction: " + this.state.clockAuction)
        console.log("  memeCore: " + this.state.memeCore)

      } catch (error){
        alert(
          'failed to load web3, accounts, contracts or bootstrap'
        );
        console.error(error);
      }
    }


  setCoo = async (event) => {
    let web3 = await this.state.web3;
    let contract = await this.state.memeCore;
    let theCoo = document.querySelector(".SetCooHandler").value;
    await this.state.memeCore.methods.setCOO(theCoo).send({from: this.state.ceoAddress});
    await this.setState({
      cooAddress: theCoo,
    })
  }

  bootstrapHandle = async (event) =>{
    let contract = await this.state.memeCore;
    let arr = [];
    for(let i =0; i<10; i++){
      arr.push(i);
    };
    let account = await this.state.cooAddress;
    console.log(account);
    await contract.methods.createLegacyAuction(0).send({from: account});
    let result = await contract.methods.getMeme(0).call();
    await console.log(result);
    await this.setState({
      bootstrapped: true
    })
  }

   pauseToggle = async (event) => {
     const contract =  await this.state.memeCore;
     console.log("We are here" + contract )
     const account = await this.state.ceoAddress;
     console.log("Now we are here " + account);
     let current;
     await contract.methods.unpause().send({from: account})
     if (this.state.paused){
        console.log(contract);

       current = await false;
     }
     if(!this.state.paused){
       await contract.methods.pause().send({from:this.state.ceoAddress})
       current = await true;
     }
     this.setState({paused: current});
     console.log(contract.methods.paused().call());
   }

   connectAuction = async (event) => {
     const contractMeme = await this.state.memeCore;
     const clockAuction = await this.state.clockAuction;
     const clockAddress = await clockAuction.options.address;
     console.log(clockAddress)

     await contractMeme.methods.setClockAuctionAddress(clockAddress).send({from: this.state.ceoAddress})

   }

   renderPageHandler = () =>{
     let boot = this.state.bootstrapped;
     console.log(boot);
     if(boot){
        return(<Body/>)
     } else {
       return(
           <div className="OwnerBtn">
              <div className="setCooBtn">
                <div className="field">
                  <input className="SetCooHandler" type="text"/>
                  <label htmlFor="register">
                    <span> COO Address </span>
                    </label>
               </div>
               <button onClick={this.setCoo.bind(this)}>
                  Add CooAddress
               </button>
              </div>
              <button className="togglePauseBtn" onClick={this.pauseToggle.bind(this)}>
                 {this.state.paused ? "Unpause Contract" : "Pause Contract"}
              </button>
              <button className="togglePauseBtn" onClick={this.connectAuction.bind(this)}>
                 Connect Clock Auction
              </button>
              <button className="togglePauseBtn" onClick={this.bootstrapHandle.bind(this)}>
                 Bootstrap Market
              </button>
              <button className="togglePauseBtn" onClick={() => this.setState({bootstrapped: true})}>
                 Skip
              </button>
           </div>
         );
     }
   }


  render() {
    if(this.state && this.state.account && this.state.web3){
      var accountInterval = setInterval(() => {
        if (this.state.web3.currentProvider.selectedAddress !== this.state.account) {
          this.setState({account: this.state.web3.currentProvider.selectedAddress})
        }
      },1000);
    }
    return(
      <div className="app">
          {this.renderPageHandler()}
      </div>
    )
  }
}

export default App;
