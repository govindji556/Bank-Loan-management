import React, { useState } from "react";

export default function UserDashboard({ user, onLogout }) {
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) {
      alert("Please enter loan amount");
      return;
    }
    alert("Loan request feature coming soon! Backend endpoints in development.");
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
          <div className="form-group">
            <label>Loan Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter loan amount"
              min="1"
            />
          </div>
          <button className="btn" type="submit">
            Request Loan
          </button>
        </form>
      </div>
    </div>
  );
}
