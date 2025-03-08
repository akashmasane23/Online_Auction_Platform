import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const Signup = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Signup failed. Please try again.");
      }

      const data = await response.json();
      console.log("✅ Signup Successful:", data);

      if (data.token) {
        localStorage.setItem("authToken", data.token);
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        throw new Error("Token missing in response.");
      }
    } catch (err) {
      console.error("❌ Signup Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Create Your Account</h2>
        <p>Join us to start bidding on amazing items.</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="signin-link">
          Already have an account? <a href="/signin">Sign In</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
