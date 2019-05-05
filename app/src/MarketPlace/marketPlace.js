import React, {useState} from "react";
import Banner from "../Banner/banner.js";
import MarketPannel from "./MarketPannel/marketPannel.js";
import "./marketPlace.css";

function MarketPlace() {

  //need a state which remembers what category we are looking for
  const [searchType, setSearchType] = useState("All")

  function handleSearchType(arg) {
    setSearchType(arg);
  }

  return(
    <div className="marketPlace">
      <Banner
        title="Meme Marketplace"
        subTitle="Buy, Sell, Meme"
        buttonFunction={null}
        buttonLabel= {null}
        rightHalf={<BigMeme />}
       />
      <div className ="MarketBar">
        <div className="barWrap">
          <button onClick={() => handleSearchType("All")}>
            All
          </button>
          <button onClick={() => handleSearchType("ForSale")}>
            For Sale
          </button>
          <button onClick={() => handleSearchType("Legacy")}>
            Legacy
          </button>
          <div>
            <MarketPannel searchType={searchType}/>
          </div>
        </div>
      </div>
    </div>
  )
}

function BigMeme() {

  return(
    <div className="bigMeme">
      <img src={require('../memes/meme-14.jpg')} alt="WolfofWallstreet"/>
    </div>
  )
}

export default MarketPlace;
