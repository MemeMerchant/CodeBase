import React, {useState} from "react";
import "./banner.css";

function Banner(props){
  // banner has left and right halves and usually follow the same behavior
  const title = props.title;
  // just text
  const subTitle = props.subTitle;
  // passes an object with the function to call on click and if a button should be rendered
  const buttonFunction = props.buttonFunction;

  const buttonLabel = props.buttonLabel;

  const rightHalf = props.rightHalf;

  function buttonHandler() {
    buttonFunction()
  }

  return(
    <div className="banner-wrapper">
      <div className="left-banner">
        <div className="banner-title">
          {title}
        </div>
        <div className="banner-subTitle">
          {subTitle}
        </div>
        <div className="button-title">
          {props.buttonLabel == null ? null :
          <button onClick={() => buttonHandler()}>
            {props.buttonLabel}
          </button>
        }
        </div>
      </div>
      <div className="right-banner">
        {rightHalf}
      </div>
    </div>
  )
}

export default Banner;
