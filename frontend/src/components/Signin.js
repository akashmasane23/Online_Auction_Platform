import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signin.css";

const Signin = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Start loading before sending the request

    try {
      const response = await fetch("http://localhost:5000/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid credentials.");
      }

      const data = await response.json();
      console.log("✅ Signin Success:", data);

      localStorage.setItem("authToken", data.token); // Fix: Store correct token
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Signin Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false); // Stop loading after request completes
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-form">
        <h2>Welcome Back!</h2>
        <p>Sign in to continue to your account.</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
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
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Signin;
