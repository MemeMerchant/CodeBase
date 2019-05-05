import React, { Component } from "react";
import Header from "./Header/header.js";
import Web3 from 'web3';
import getMemeContract from "./MemeContract/memeContract.js";


import "./App.css";


class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      ownerAddress: 0,
      web3: new Web3("ws://localhost:8545"),
      memeCore: 0,
      paused: null,
      clockAuction: 0,
    }
  }

  componentWillMount() {
      getMemeContract().then((memecontract) =>{
          this.setState({
            memeCore: memecontract;
          })
          this.instantiateContract()
        })
        .catch(() => {
          console.log('Error finding MemeCore')
        })
      )
    }

    instantiateContract = () =>{
      let web3 = this.state.web3;
      let owner = web3.

       this.state.memeCore.unpause({
         from:
       })
     }
   };
  }


  this.fetchMemeContract().then((memeCore) => {
     memeCore({from: web3.currentProvider.addre})
     var arr = []
     for(var i = 0; i < arrayLength; i++){
       arr.push(i);
     }
     setMemeArray(arr);
    }
  );


  render() {
    return(
      <Header />
    )
  }
}

export default App;
