import React, { useState, useEffect } from "react";

export default function ManagerDashboard({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/loan-requests");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:8000/loan/${id}/${status}`, {
        method: "PUT",
      });
      if (response.ok) {
        setRequests(requests.map(r =>
          r.id === id ? { ...r, status } : r
        ));
        alert(`Loan ${status} successfully!`);
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="dashboard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Manager Dashboard</h1>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <div className="collapsible-section">
        <div
          className="collapsible-header"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>📋 Loan Requests</span>
          <span>{isOpen ? "▲" : "▼"}</span>
        </div>

        {isOpen && (
          <div className="collapsible-content">
            {loading ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                Loading requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="empty-message">No loan requests</div>
            ) : (
              <div className="requests-list">
                {requests.map((req) => (
                  <div key={req.id} className="request-item">
                    <div className="request-details">
                      <p>
                        <strong>Username:</strong> {req.username}
                      </p>
                      <p>
                        <strong>Amount:</strong> ₹{req.amount?.toLocaleString() || 0}
                      </p>
                      <p>
                        <span className={`status-badge status-${req.status}`}>
                          {req.status}
                        </span>
                      </p>
                    </div>
                    <div className="request-actions">
                      <button
                        className="btn-approve"
                        onClick={() => updateStatus(req.id, "approved")}
                        disabled={req.status !== "pending"}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => updateStatus(req.id, "rejected")}
                        disabled={req.status !== "pending"}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
