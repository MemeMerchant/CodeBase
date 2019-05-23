import React, {useState, useEffect} from "react";
import "./marketPannel.css";
import getMemeContract from "../../MemeContract/memeContract.js";
import getClockAuction from "../../ClockAuction/clockAuction.js";
import Banner from "../../Banner/banner.js";
import Web3 from "web3";

 function MarketPannel(props){
  // use searchType prop to filter meme's
  // searchtype == all ? display all memes in ID array :
  // searchType == ForSale ? display only forSale Meme's :
  // searchType == Legacy ? display only legacy meme's :
  const [arrayLength, setMemeArrayLength] = useState(0);
  const [memeArray, setMemeArray] = useState();
  const [memeContract,setMemeContract]= useState(0);
  const [auctionContract, setAuctionContract] = useState(0);
  const [memePopUp, setMemePopUp] = useState(null);
  const [web3, setWeb3] = useState(new Web3("ws://localhost:8545"));


  if(memeContract == 0){
    getMemeContract.then((result) => {
      setMemeContract(result)
    });
  }

  if(auctionContract ==0){
    getClockAuction.then((results)=>{
      setAuctionContract(results)
    });
  }

  useEffect(() => {
    if(memeContract != 0 && auctionContract!=0){
    }
  },[memeContract, auctionContract,props.searchType])

  useEffect(() =>{
    if(auctionContract!=0){
      setArrayLength();
    }
  },[auctionContract,props.searchType])

  useEffect(() =>{
    if(arrayLength != 0){
      renderArray()
    }
  },[arrayLength, props.searchType])

  async function setArrayLength(){
    const arrayLength = await memeContract.methods.getTotalMemes().call();
    setMemeArrayLength(arrayLength);
  }


  async function renderArray(){
    if(props.searchType === "All"){
         var arr = []
         for(var i = 0; i < arrayLength; i++){
          await arr.push(i);
         }
         await setMemeArray(arr);
        }

    if(props.searchType === "ForSale"){
        console.log("FORSALE")
        var arr =[]
        console.log(auctionContract);
        for(var i=0; i<arrayLength; i++){
         let res = await auctionContract.methods.getOnAuction(i).call();
         if(res){arr.push(i)};
        }
        setMemeArray(arr);
        console.log(arr);
    }

    if(props.searchType === "Legacy"){
        var arr = [];
        for(var i =0; i<arrayLength; i++){
          let res =  await memeContract.methods.isLegacyMeme(i).call();
          if(res){arr.push(i);}
        }
        setMemeArray(arr);
        console.log(arr);
        // know length, loop through array of meme's within lenght
        // in loop check if generation == o and add to new array
    }
  }


  function handleLoadGrids() {
    let total = arrayLength;
    let numRows = total / 4;
    numRows = Math.ceil(numRows);
    let arr =[];
    for(let i = 0; i < numRows; i++){
        arr.push(<MarketPannelRow
          array={memeArray}
          Toggle={togglePopUp}
          getFeatures={getFeatures}/>)
    }
    return(arr);
  }

  function togglePopUp(x){
    if(memePopUp !== x){
      setMemePopUp(x);
    }else{
      if(memePopUp != null){
        return(renderPopUp());
      }
    }

  }

  function renderPopUp(){
    let memeId = memePopUp;
    console.log(memeId + "This is in pop up");
    let memeName;
    let currentAccount = web3.currentProvider.selectedAddress;
    console.log(currentAccount);
    if(memeId == 0){
      console.log("aliens")
      memeName = "Aliens";
    }else if(memeId == 1){
      console.log("aruthr")
      memeName = "Arthur's Fist";
    }
    let owner;
    let price;
    if(memeId !== null){
      return(
        <div className='popup'>
          <div className='popup_inner'>

            <Banner
              className="popUP"
              title={memeName}
              subTitle="The MemeCosts X ether"
              buttonFunction={() => togglePopUp(null)}
              buttonLabel={"Buy " + memeName}
              rightHalf={
                <div className="gridMeme">
                  <img src={require('../../memes/meme-' + memeId + '.jpg')}/>
                </div>
              }
            />
          </div>
        </div>
      )
    }else{
      return(null)
    }
  }

 async function getFeatures(x){
   let auctioned = await auctionContract.methods.getOnAuction(x).call();
   console.log(auctioned);
   if(auctioned == true){
     let result = await auctionContract.methods.getCurrentPrice(x).call();
     result = web3.utils.fromWei(result, "ether");
     result = parseFloat(result).toFixed(5);
     return(result)
   }else if(auctioned == false){
     console.log("suh")
     return("NA");
   }

   // If i were to make this an async function, the function would return a
   // promise, in which case we could always use a then value...
   // Meme's weren't on auction, so the method call was throwing an error, and
   // you can't call .then on an error, only a promise. See if, you can return
   // the null value for the meme if it isn't on auction so no price display's
   // or an "NA" value displays to indicate not on auction.
   // may have to force a promise, because a not-on-auction meme may auto-return
   // instead of a promise which will screw with how the calling function handles
   // the call as sometimes it would be a promise and sometimes it returns a value

   // auctionContract.methods.getCurrentPrice(x).call().catch(err => {
   //   console.log("an error occured during method call");
   // })
   // return(1);
   /*.then((res) => {
     console.log("get features running")
     return(
     <div className="MemePrice">
         {"Current Price: " + res }
     </div>
   )
   }
 ).catch(err =>  {
   console.log("an error occured during the call ");
 });*/
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
              {handleLoadGrids()}
            </div>
          }
          {
           togglePopUp(memePopUp)

          }
         </div>
       }
   </div>
  )
}


// make a for loop that Generates Market Pannel Rows based on number of meme's
// divide by 4 and then loop up to the cieling



function MarketPannelRow(props){
  // make array a state variable so that it rerenders this component once it updates
  // use effect to get features?
  const [subArray, setSubArray] = useState([]);
  let array = props.array;
  let toggleButton = props.Toggle;
  let getFeatures = props.getFeatures;
  let retArray = [];
  for(var i = 0; i < array.length; i++){
    let id = array[i];
    getFeatures(id).then((result) =>{
      retArray.push(
        <div className="marketMeme">
          <button onClick={() => toggleButton(id)}>
            <img src={require('../../memes/meme-' + id + '.jpg')}/>
          </button>
          <div className="MemeDetails1">
            {"Price: " + result}
          </div>
          <div className="MemeDetails2">
            {"Price: " + result}
          </div>
        </div>
        //<MemeObject memeId = id/>
      )
      setSubArray(retArray);
    })
  }
  return(subArray)
}

// function MemeObject(props){
//   let id = props.memeId;
//   let fetures;
//   getFeatures(id).then((result) => {
//     price = result;
//
//   })
//
//   return(
//     <div className="marketMeme">
//       <button onClick={() => toggleButton(id)}>
//         <img src={require('../../memes/meme-' + id + '.jpg')}/>
//       </button>
//       <div className="MemeDetails1">
//         {"Price: " + result}
//       </div>
//       <div className="MemeDetails2">
//         {"Price: " + result}
//       </div>
//     </div>
// //   )
// }








export default MarketPannel;
