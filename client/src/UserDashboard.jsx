import React, { useState } from "react";
import { apiPost } from "../services/apiService";

export default function UserDashboard({ user, onLogout }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) {
      setError("Please enter loan amount");
      return;
    }
    if (amount <= 0) {
      setError("Loan amount must be greater than 0");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiPost("/loans/request", {
        user_id: user.id,
        amount: parseFloat(amount),
      });
      
      setSuccess("Loan request submitted successfully!");
      setAmount("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to submit loan request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>User Dashboard</h1>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <div className="user-dashboard">
        <h2>Welcome, {user.name}</h2>

        <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "30px auto" }}>
          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}
          
          <div className="form-group">
            <label>Loan Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter loan amount"
              min="1"
              disabled={loading}
            />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Request Loan"}
          </button>
        </form>
      </div>
    </div>
  );
}
