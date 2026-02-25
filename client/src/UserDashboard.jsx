import React, { useState, useEffect } from "react";
import { apiPost, apiGet } from "./services/apiService.js";
import { useNotificationPolling } from "./hooks/useNotificationPolling.js";
import NotificationToast from "./components/NotificationToast.jsx";

export default function UserDashboard({ user, onLogout }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [availableLoans, setAvailableLoans] = useState([]);
  const [applyAmounts, setApplyAmounts] = useState({});
  const { notifications, removeNotification } = useNotificationPolling(10000);

  useEffect(() => { fetchAvailableLoans(); }, []);

  const fetchAvailableLoans = async () => {
    try {
      const data = await apiGet("/loans/");
      console.log("Available loans:", data);
      setAvailableLoans(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (loanId, amountValue) => {
    const amount = parseFloat(amountValue);
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    setLoading(true); setError(""); setSuccess("");
    try {
      await apiPost(`/loans/apply`, { loan_id: loanId, amount });
      setSuccess("Loan request submitted successfully!");
      setApplyAmounts(prev => ({ ...prev, [loanId]: "" }));
      setTimeout(() => setSuccess(""), 3000);
      fetchAvailableLoans();
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

      {notifications.map(notif => (
        <NotificationToast
          key={notif.id}
          notification={notif}
          onClose={() => removeNotification(notif.id)}
        />
      ))}

      <div className="user-dashboard">
        <h2>Welcome, {user.name}</h2>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <h3>Available Loans</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {availableLoans.map((loan, idx) => {
            const inputKey = loan.id ?? `idx-${idx}`;
            return (
              <div key={loan.id ?? inputKey} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{loan.name}</strong>
                  <div>Interest: {loan.interest_rate}%</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={applyAmounts[inputKey] || ''}
                    onChange={(e) => setApplyAmounts(prev => ({ ...prev, [inputKey]: e.target.value }))}
                  />
                  <button
                    className="btn"
                    onClick={() => loan.id ? handleApply(loan.id, applyAmounts[inputKey]) : null}
                    disabled={loading || !loan.id}
                  >
                    Apply
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
