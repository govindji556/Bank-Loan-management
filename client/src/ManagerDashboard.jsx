import React, { useEffect, useState } from "react";
import Collapsible from "./Collapsible";

function ManagerDashboard() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await fetch("http://localhost:8000/loan-requests");
    const data = await res.json();
    setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, decision) => {
    await fetch(`http://localhost:8000/loan/${id}/${decision}`, {
      method: "PUT"
    });
    fetchRequests();
  };

  return (
    <div className="dashboard">
      <h2>Manager Dashboard</h2>

      <Collapsible title="Loan Requests">
        {requests.map((req) => (
          <div key={req.id} className="request-card">
            <p><strong>User:</strong> {req.username}</p>
            <p><strong>Amount:</strong> ₹{req.amount}</p>
            <p><strong>Status:</strong> {req.status}</p>

            <button
              className="approve-btn"
              onClick={() => updateStatus(req.id, "approved")}
            >
              Approve
            </button>

            <button
              className="reject-btn"
              onClick={() => updateStatus(req.id, "rejected")}
            >
              Reject
            </button>
          </div>
        ))}
      </Collapsible>
    </div>
  );
}

export default ManagerDashboard;
