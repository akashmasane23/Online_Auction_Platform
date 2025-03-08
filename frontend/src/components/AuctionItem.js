import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuctionItem.css';

const AuctionItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBidPlaced, setIsBidPlaced] = useState(false); // Track if bid is placed

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auctions/${id}`);
        const data = await response.json();
        if (response.ok && data.data) {
          setAuction(data.data);
          setCurrentBid(Number(data.data.currentBid) || 0);
        } else {
          setError(data.error || 'Failed to load auction details.');
        }
      } catch (err) {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]);

  const handleBid = async () => {
    try {
      const newBid = currentBid + 1000;
      const token = localStorage.getItem("authToken");

      if (!token) {
        alert("You must be signed in to place a bid.");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/auctions/${id}/bid`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  
        },
        body: JSON.stringify({ bidAmount: newBid })
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setCurrentBid(Number(data.data.currentBid) || newBid);
        alert("Bid placed successfully!");
        setIsBidPlaced(true); // Enable "Pay Now" button
      } else {
        alert(data.error || 'Failed to place bid.');
      }
    } catch (err) {
      alert('Something went wrong while placing the bid.');
    }
  };

  const handleTestPayment = () => {
    if (!isBidPlaced) {
      alert("Please place a bid first.");
      return;
    }

    if (window.confirm("Proceed with test payment?")) {
      setTimeout(() => {
        alert("✅ Payment Successful! Your bid has been placed.");
        setIsBidPlaced(false); // Reset bid status after "payment"
      }, 2000);
    }
  };

  if (loading) return <p>Loading auction details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!auction) return <p>No auction found.</p>;

  return (
    <div className="auction-item">
      <h2>{auction.title}</h2>
      <p>{auction.description}</p>
      {auction.image && <img src={auction.image} alt={auction.title} className="auction-image" />}
      <p>Current Bid: ₹{currentBid}</p>
      
      <button className="bid-button" onClick={handleBid}>Place Bid (+₹1000)</button>
      <button 
        className="pay-button" 
        onClick={handleTestPayment} 
        disabled={!isBidPlaced} // Only enabled after bid is placed
      >
        Pay Now (Test Mode)
      </button>
    </div>
  );
};

export default AuctionItem;
