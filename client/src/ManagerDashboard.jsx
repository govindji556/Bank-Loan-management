import React, { useEffect, useState } from "react";
import Collapsible from "./Collapsible";

function ManagerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:8000/loan-requests");
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, decision) => {
    try {
      const res = await fetch(`http://localhost:8000/loan/${id}/${decision}`, {
        method: "PUT"
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchRequests();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const badgeClass = `status-badge status-${status?.toLowerCase() || 'pending'}`;
    return <span className={badgeClass}>{status || "Pending"}</span>;
  };

  return (
    <div className="dashboard">
      <h2>📋 Manager Dashboard</h2>

      <Collapsible title="Loan Requests">
        {loading ? (
          <div className="loading">Loading requests</div>
        ) : error ? (
          <div style={{ color: '#dc3545', padding: '20px', textAlign: 'center' }}>
            Error: {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <p>No loan requests at the moment</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="request-card">
              {getStatusBadge(req.status)}
              
              <div className="request-info">
                <div className="request-info-item">
                  <strong>Applicant</strong>
                  <span>{req.username}</span>
                </div>
                <div className="request-info-item">
                  <strong>Loan Amount</strong>
                  <span>₹{req.amount?.toLocaleString()}</span>
                </div>
              </div>

              <div className="request-actions">
                <button
                  className="approve-btn"
                  onClick={() => updateStatus(req.id, "approved")}
                  disabled={req.status !== "pending"}
                >
                  ✓ Approve
                </button>
                <button
                  className="reject-btn"
                  onClick={() => updateStatus(req.id, "rejected")}
                  disabled={req.status !== "pending"}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ))
        )}
      </Collapsible>
    </div>
  );
}

export default ManagerDashboard;
