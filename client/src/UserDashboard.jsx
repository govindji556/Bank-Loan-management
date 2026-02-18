import React, { useState } from "react";

export default function UserDashboard({ user, onLogout }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) {
      alert("Please enter loan amount");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/loan-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          amount: parseFloat(amount),
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setAmount("");
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await response.json();
        alert(data.detail || "Failed to submit request");
      }
    } catch (err) {
      alert("Error: " + err.message);
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
        <h2>Welcome, {user.username}</h2>

        {success && (
          <div className="alert success">
            Loan request submitted successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "30px auto" }}>
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
