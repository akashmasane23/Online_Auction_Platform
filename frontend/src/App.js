import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Dashboard from './components/Dashboard';
import AuctionItem from './components/AuctionItem';
import PostAuction from './components/PostAuction';
import Landing from './components/Landing';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };

  return (
    <Router>
      <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
        <header>
          <h1>Auction App</h1>
          <nav>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/signup" className="nav-link">Signup</Link>
            <Link to="/signin" className="nav-link">Signin</Link>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/post-auction" className="nav-link">Post Auction</Link>
            {isAuthenticated && (
              <button onClick={handleLogout} className="nav-link logout-button">Logout</button>
            )}
          </nav>
          <button onClick={toggleDarkMode} className="theme-toggle">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/signin" element={<Signin setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/dashboard" element={<Dashboard isAuthenticated={isAuthenticated} />} />
            <Route path="/auction/:id" element={<AuctionItem />} />
            <Route path="/post-auction" element={<PostAuction />} />
          </Routes>
        </main>
        <footer>
          <p>&copy; 2025 Auction App. All rights reserved.</p>
          <p>Welcome to the best place to buy and sell items through auctions!</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;