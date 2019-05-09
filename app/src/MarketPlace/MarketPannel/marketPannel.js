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
        console.log("hererere")
      setMemeContract(result)
    });
  }

  if(auctionContract ==0){
    getClockAuction.then((results)=>{
      console.log("si this happenign")
      setAuctionContract(results)
    });
  }

  useEffect(() => {
    if(memeContract != 0 && auctionContract!=0){
      console.log(memeContract);
      //setArrayLength();
    }
  },[memeContract, auctionContract,props.searchType])

  useEffect(() =>{
    if(auctionContract!=0){
      console.log(auctionContract);
      setArrayLength();
    }
  },[auctionContract,props.searchType])

  useEffect(() =>{
    if(arrayLength != 0){
      renderArray()
      console.log("hey there");
    }
  },[arrayLength, props.searchType])

  async function setArrayLength(){
    const arrayLength = await memeContract.methods.getTotalMemes().call();
    setMemeArrayLength(arrayLength);
  }


  async function renderArray(){
    if(props.searchType === "All"){
         console.log(arrayLength);
         var arr = []
         for(var i = 0; i < arrayLength; i++){
          await arr.push(i);
          console.log(i);
         }
         console.log(arr);
         await setMemeArray(arr);
         console.log(memeArray);
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

  console.log(memeArray)
  console.log(memePopUp);

  function handleLoadGrids() {
    let total = arrayLength;
    let numRows = total / 4;
    numRows = Math.ceil(numRows);
    let arr =[];
    for(let i = 0; i < numRows; i++){
        arr.push(<MarketPannelRow array={memeArray} Toggle={togglePopUp}/>)
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
  let array = props.array;
  let toggleButton = props.Toggle;


  let retArray = [];
  for(var i = 0; i < array.length; i++){
    let id = array[i];
    retArray.push(
      <div className="marketMeme">
      <button onClick={() => toggleButton(id)}>
        <img src={require('../../memes/meme-' + id + '.jpg')}/>
      </button>
      </div>
    )
  }
  return(retArray)
}









export default MarketPannel;
