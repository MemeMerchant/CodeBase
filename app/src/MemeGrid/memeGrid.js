import React, {useState, useEffect} from "react";
import "./memeGrid.css"

function MemeGrid(){

  const row1 = GridMemeRow(1);
  const row2 = GridMemeRow(2);
  const row3 = GridMemeRow(3);
  const row4 = GridMemeRow(4);
  return(
    <div>
      <div className="rows">
        {row1}
      </div>
      <div className="rows">
        {row2}
      </div>
      <div className="rows">
        {row3}
      </div>
      <div className="rows">
        {row4}
      </div>
    </div>
  )
}

function GridMemeRow(starter){
  // puts the meme's into rows of 4 columns

  const [i, setI] = useState(1);
  const [j, setJ] = useState(1);
  const [k, setK] = useState(1);
  const [l, setL] = useState(1);


  // setTimeout(() => {
  //   setI(i+1);
  // }, 30000)
  //
  //
  // setTimeout(() => {
  //   setJ(j+1);
  // }, 10000)
  //
  // setTimeout(() => {
  //   setK(k+1);
  // }, 5000)
  //
  //
  // setTimeout(() => {
  //   setL(l+1);
  // }, 15000)


  const row = [GridMeme(3 * starter % 36),
               GridMeme(5 * starter % 36),
               GridMeme(7 * starter % 36),
               GridMeme(8 * starter % 36)];

  const list = row.map((component,index) =>

      component

)

  return(
    <div className="gridRow">
      {list}
    </div>
  )
}

function GridMeme(memeId){
  // function loads the image
  const [id, setId] = useState(memeId);

  setTimeout(()=>{
    setId(id*id % 35 +1)
  }, (2300 * memeId) %100000)



  return(
    <div className="gridMeme">
      <img src={require('../memes/meme-' + id + '.jpg')}/>
    </div>
  )
}

export default MemeGrid;
