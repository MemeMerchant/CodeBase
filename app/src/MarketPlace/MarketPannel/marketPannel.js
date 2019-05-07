import React, {useState, useEffect} from "react";
import "./marketPannel.css";
import getMemeContract from "../../MemeContract/memeContract.js";

 function MarketPannel(props){
  // use searchType prop to filter meme's
  // searchtype == all ? display all memes in ID array :
  // searchType == ForSale ? display only forSale Meme's :
  // searchType == Legacy ? display only legacy meme's :
  const [arrayLength, setMemeArrayLength] = useState(0);
  const [memeArray, setMemeArray] = useState();
  const [memeContract,setMemeContract]= useState(0);


  if(memeContract == 0){
    getMemeContract().then((result) => {
      setMemeContract(result)
    });
  }

  useEffect(() => {
    if(memeContract != 0 ){
      console.log(memeContract);
      setArrayLength();
    }
  },[memeContract,props.searchType])

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
          setMemeArray(arr);

      }

      if(props.searchType === "Legacy"){
          var arr = [];
          for(var i =0; i<arrayLength; i++){
            let res =  memeContract.methods.isLegacyMeme(i);
            if(res){arr.push(i);}
          }
          setMemeArray(arr);
          console.log(arr);
          // know length, loop through array of meme's within lenght
          // in loop check if generation == o and add to new array
      }
    }

    console.log(memeArray)



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
              <MarketPannelRow array={memeArray}/>
            </div>
           }
         </div>
       }
   </div>
  )
}

async function fetchMemeContract(){
  console.log('here')
  let result = await getMemeContract();
  return(result);
}



function MarketPannelRow(props){
  let array = props.array;

  let retArray = [];

  for(var i =0; i < array.length; i++){
    retArray.push(
      <div className="marketMeme">
        <button>
          <img src={require('../../memes/meme-' + i + '.jpg')}/>
        </button>
      </div>
    )
  }
  return(retArray)

}

export default MarketPannel;
