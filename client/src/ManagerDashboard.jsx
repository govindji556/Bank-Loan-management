import React, { useState, useEffect } from "react";
import Collapsible from "./Collapsible";
import { apiGet, apiPut } from "../services/apiService";

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
      const data = await apiGet("/loan-requests");
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiPut(`/loan/${id}/${status}`);
      setRequests(requests.map(r =>
        r.id === id ? { ...r, status } : r
      ));
      alert(`Loan ${status} successfully!`);
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
        <Collapsible title="📋 Loan Requests">
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
        </Collapsible>
      </div>
    </div>
  );
}
