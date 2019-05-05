import React, {useState, useEffect} from "react";
import "./marketPannel.css";
import getMemeContract from "../../MemeContract/memeContract.js";

import Web3 from "web3";

function MarketPannel(props){
  // use searchType prop to filter meme's
  // searchtype == all ? display all memes in ID array :
  // searchType == ForSale ? display only forSale Meme's :
  // searchType == Legacy ? display only legacy meme's :
  const [memeArray, setMemeArray] = useState([]);
  const [web3,setWeb3] = useState(new Web3("ws://localhost:8545"));
  const [memeContract,setMemeContract]= useState();


  async function fetchMemeContract() {
    try {
      let memeCore = await getMemeContract();
      await setMemeContract(memeCore);
      return(memeCore)
    } catch(error){
      alert('failed to find MemeCore Contract');
      console.error(error);
    }
  }

  // const arrayLength = memeContract.getTotalMemes() -1;

  if(props.searchType === "All"){
    fetchMemeContract().then((memeCore) => {
       const arrayLength = memeCore.methods.getTotalMemes();
       var arr = []
       for(var i = 0; i < arrayLength; i++){
         arr.push(i);
       }
       setMemeArray(arr);
      }
    );
  }

  if(props.searchType === "ForSale"){
    fetchMemeContract().then( (memeCore) => {
      // use onAuction() getter from ClockAuction contract
      // need to write the auction getter contract component
    })
  }

  if(props.searchType === "Legacy"){
    fetchMemeContract().then(  (memeCore) => {
      const arrayLength =  memeCore.methods.getTotalMemes();
      var arr = [1];
      for(var i =0; i<arrayLength; i++){
        let res =  memeCore.methods.isLegacyMeme(i);
        if(res){arr.push(i);}
      }
       setMemeArray(arr);
      console.log(arr);
      // know length, loop through array of meme's within lenght
      // in loop check if generation == o and add to new array
    })
  }

  return(
    <div>
      {memeArray === undefined ?
        <div className="LoadingPannel">
          //need to hvae loading message for accessing meme counts
          //if array length !>0, not loaded
        </div>
        :
        <div className="GridBody">
          {memeArray.length === 0
            ?
            <div className="noMemeLoad">
              There are currently no Meme's in the market. <br/> Please wait for the
              first Legacay Meme's to be placed on auction {props.searchType}
            </div>
            :
            <div className="LoadingMemeGrids">
              {"MarketPannelArray"}
            </div>
          }
        </div>
      }
  </div>
  )
}


function MarketPannelRow(props){
  // create's rows with 4 columns meme's that fall under search category
  // # of rows depends on the number of meme's in array
  // gotta get computer sciency here

}

export default MarketPannel;
