import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auctions');
        const data = await response.json();
        console.log("Auction API Response:", data); // Debugging log

        if (response.ok) {
          setAuctions(data.data); // ✅ Correctly setting auctions
        } else {
          setError('Failed to load auctions. Please try again.');
        }
      } catch (err) {
        setError('Something went wrong. Please check your connection.');
        console.error('Fetch Auctions Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Active Auctions</h2>

      {loading && <p>Loading auctions...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="auctions-grid">
        {auctions.length > 0 ? (
          auctions.map((auction) => (
            <div key={auction._id} className="auction-card">
              <img 
                src={auction.image ? auction.image : 'default.jpg'} 
                alt={auction.title} 
                className="auction-image" 
              />
              <div className="auction-details">
                <h3>{auction.title}</h3>
                <p>{auction.description}</p>
                <p>Current Bid: ₹{auction.currentBid}</p>
                
                <Link to={`/auction/${auction._id}`} className="bid-button">View Details</Link>
              </div>
            </div>
          ))
        ) : (
          !loading && <p>No active auctions available.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
