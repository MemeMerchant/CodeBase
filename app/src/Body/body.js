import React, { useState} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Home from "../Home/home.js";
import MarketPlace from "../MarketPlace/marketPlace.js";
import "./body.css";

//All of these components will eventually be replaced with their actual component pages
// and they will be imported to be called by the router


function MemeFolio() {
  return(
    <div>
      This is the MemeFolio Page
    </div>
  )
};

function About() {
  return(
    <div>
      This is the About Page
    </div>
  )};


function Body() {
  // need marketplace button, memefolio button and about button on the left
  // the logo will be on the right. Logo will also act as home button
  // will want to have some form of active button managment (could just use css)
  // implement React Router once structure understood.

  return(
    <Router>
      <div>
        <nav>
          <div className="left-half">
            <Link className="link" to="/marketplace/">MARKETPLACE</Link>
            <Link className="link" to="/memeFolio/">MEMEFOLIO</Link>
            <Link className="link" to="/about/">ABOUT</Link>
          </div>
          <div className="right-half">
            <Link className="link logo" to="/"></Link>
          </div>
        </nav>

        <Route  path="/marketplace/" component={MarketPlace} />
        <Route  path="/memeFolio/" component={MemeFolio} />
        <Route  path="/about/" component={About} />
        <Route  path="/" exact component={Home} />
      </div>
    </Router>
  )
};

export default Body;
