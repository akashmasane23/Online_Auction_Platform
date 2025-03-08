import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      <div className="hero">
        <h1>Bid on the perfect items to fuel your online success.</h1>
        <p>Discover unique items and place your bids today!</p>
        <Link to="/signup" className="cta-button">Get Started</Link>
      </div>
    </div>
  );
};

export default Landing;