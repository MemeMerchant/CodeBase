import React, { Component } from "react";
import Body from "./Body/body.js";
import Web3 from 'web3';
import getClockAuction from "./ClockAuction/clockAuction.js";
import getMemeContract from "./MemeContract/memeContract.js";


import "./App.css";


class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      ownerAddress: 0,
      cooAddress: 0,
      web3: new Web3("ws://localhost:8545"),
      memeCore: 0,
      paused: false,
      clockAuction: 0,
      bootstrapped: false,
    }
  }

  componentWillMount() {
      getMemeContract().then((memecontract) =>{
        this.setState({
          memeCore: memecontract
        })
        console.log("this happened")
      }).then(() =>{
        this.state.memeCore.methods.paused().call().then((result) => {
          this.setState({
            paused: result,
          })
        }).then(() =>{
          this.state.memeCore.methods.getMeme(0).call().then((result) => {
            let res;
            result === null ? res = false : res = true;
            this.setState({
              bootstrapped: res,
            })
          })
        })
      })



      getClockAuction().then((clockAuctionContract) =>{
        this.setState({
          clockAuction: clockAuctionContract,
        })
        console.log('made it here')
      })
    .catch(() => {
      console.log('Error finding deployed contracts')
    })
      //getClockAuction
      //then attach clockAuction to memeCore
  }



  setCoo = async (event) => {
    let web3 = await this.state.web3;
    let accounts = await this.state.web3.eth.getAccounts()
    let contract = await this.state.memeCore;
    console.log(contract);
    await this.setState({
      ownerAddress: accounts[0],
      cooAddress: accounts[1],
    })
    await this.state.memeCore.methods.setCOO(this.state.cooAddress).send({from: this.state.ownerAddress});
    let coo = await contract.methods.cooAddress().call({from: accounts[0]});
    await console.log(accounts[1] +"      " + coo );
  }

  bootstrapHandle = async (event) =>{
    console.log("bootstrap");
    let contract = await this.state.memeCore;
    let arr = [];
    for(let i =0; i<10; i++){
      arr.push(i);
    };
    let account = await this.state.cooAddress;
    await contract.methods.createLegacyAuction(0).send({from: account});
    let result = await contract.methods.getMeme(0).call();
    await console.log(result);
    // for(const item of arr){
    //   await contract.methods.createLegacyAuction(0).send({from: account});
    //   await console.log("Deploy LegacyAuction: " + item);
    // }

     await this.setState({
      bootstrapped: true
    })
  }

   pauseToggle = async (event) => {
     const contract =  await this.state.memeCore;
     console.log(contract);
     const account = await this.state.ownerAddress;
     let current;
     if (this.state.paused){
       await contract.methods.unpause().send({from: account})
       current = await false;
     }
     if(!this.state.paused){
       await contract.methods.pause().send({from:this.state.ownerAddress})
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

     await contractMeme.methods.setClockAuctionAddress(clockAddress).send({from: this.state.ownerAddress})

   }

   renderPageHandler = () =>{
     let boot = this.state.bootstrapped;
     console.log(boot);
     if(boot){
        return(<Body/>)
     } else {
       return(
           <div className="OwnerBtn">
              <button className="togglePauseBtn" onClick={this.pauseToggle.bind(this)}>
                 {this.state.paused ? "Unpause Contract" : "Pause Contract"}
              </button>
              <button className="togglePauseBtn" onClick={this.setCoo.bind(this)}>
                Set CooAddress
              </button>
              <button className="togglePauseBtn" onClick={this.connectAuction.bind(this)}>
                 Connect Clock Auction
              </button>
              <button className="togglePauseBtn" onClick={this.bootstrapHandle.bind(this)}>
                 Bootstrap Market
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
