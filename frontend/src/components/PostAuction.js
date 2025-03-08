import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PostAuction.css";

const PostAuction = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startingBid: "",
    category: "",
    endTime: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  // Handle file input change for image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0] || null; // Ensure null if no file selected
    setFormData({ ...formData, image: file });
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken"); // Retrieve JWT token
    console.log("🔹 Token Retrieved:", token); // Debugging step

    if (!token) {
      alert("You must be logged in to post an auction.");
      return;
    }

    // Validate form fields
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Title and description are required.");
      return;
    }
    if (!formData.startingBid || isNaN(formData.startingBid) || Number(formData.startingBid) <= 0) {
      alert("Starting bid must be a valid positive number.");
      return;
    }
    if (!formData.endTime || new Date(formData.endTime) <= new Date()) {
      alert("End time must be in the future.");
      return;
    }

    // Build FormData to send data including file
    const postData = new FormData();
    postData.append("title", formData.title);
    postData.append("description", formData.description);
    postData.append("startingBid", Number(formData.startingBid)); // Ensure numeric
    if (formData.category.trim()) postData.append("category", formData.category);
    postData.append("endTime", formData.endTime);
    if (formData.image) {
      postData.append("image", formData.image);
    }

    try {
      const response = await fetch("http://localhost:5000/api/auction", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Ensure token is included
        },
        body: postData,
      });

      console.log(response);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Auction Posted Successfully:", result);
        alert("Auction posted successfully!");
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        console.error("❌ Error posting auction:", errorData.error || response.statusText);
        alert(`Error: ${errorData.error || "Failed to post auction."}`);
      }
    } catch (error) {
      console.error("❌ Error posting auction:", error);
      alert("An error occurred while posting the auction.");
    }
  };

  return (
    <div className="post-auction-container">
      <div className="post-auction-form">
        <h2>Post Auction</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              placeholder="Enter auction title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Enter auction description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="startingBid">Starting Bid</label>
            <input
              type="number"
              id="startingBid"
              placeholder="Enter starting bid"
              value={formData.startingBid}
              onChange={(e) => setFormData({ ...formData, startingBid: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category (optional)</label>
            <input
              type="text"
              id="category"
              placeholder="Enter category (e.g., Electronics, Art)"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="endTime">End Time</label>
            <input
              type="datetime-local"
              id="endTime"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="image">Image Upload</label>
            <input type="file" id="image" onChange={handleFileChange} />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>
          <button type="submit" className="submit-button">
            Post Auction
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostAuction;
