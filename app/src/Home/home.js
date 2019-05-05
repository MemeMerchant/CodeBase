import React, {useState} from "react";
import Banner from "../Banner/banner.js";
import MemeGrid from "../MemeGrid/memeGrid.js";
import "./home.css";

function Home(){
  // home is composed of the home banner, info banner, and lets meme banner
  const [current, setCurrent] = useState(0);

  function startFunction(){
    setCurrent(current+1)
  }

  return(
    <div className="Home">
      <Banner
        title="Meme Merchant"
        subTitle="Create, Collect, Trade, Share"
        buttonFunction={() => startFunction()}
        buttonLabel="Get Started"
        rightHalf={<MemeGrid/>}
       />
      <div className="userCount">
        Number of people who have started: {current}
      </div>
      <div className="info-Columns">
        <div className="first-Column">
          <div className="first-icon">
            i
          </div>
          <div className="info">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed nibh ligula, mattis sed lorem eget, pretium interdum sapien.
            Ut pulvinar augue lacus, non dictum nisi congue quis.
            Proin ac laoreet nulla.
          </div>
        </div>
        <div className="second-Column">
          <div className="second-icon">
            i
          </div>
          <div className="info">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed nibh ligula, mattis sed lorem eget, pretium interdum sapien.
            Ut pulvinar augue lacus, non dictum nisi congue quis.
            Proin ac laoreet nulla.
          </div>
        </div>
        <div className="third-Column">
          <div className="third-icon">
           i
          </div>
          <div className="info">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed nibh ligula, mattis sed lorem eget, pretium interdum sapien.
            Ut pulvinar augue lacus, non dictum nisi congue quis.
            Proin ac laoreet nulla.
          </div>
        </div>
      </div>
      <div className="letsMemeSection">
        <div className="starting-text">
          Let's meme.
        </div>
        <button onClick={() => startFunction()}>
          Get Started
        </button>
      </div>
    </div>
  )
}

export default Home;
