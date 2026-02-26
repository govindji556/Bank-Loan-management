import React, { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "./services/apiService.js";

export default function ManagerLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [interestRate, setInterestRate] = useState(0);
  const [editing, setEditing] = useState(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/manager/loans/");
      setLoans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, interest_rate: parseFloat(interestRate) };
      if (editing) {
        await apiPut(`/manager/loans/${editing}`, payload);
        setEditing(null);
      } else {
        await apiPost(`/manager/loans/`, payload);
      }
      setName(""); setInterestRate(0);
      fetchLoans();
    } catch (err) {
      alert(err.message || "Failed to save loan");
    }
  };

  const startEdit = (loan) => {
    setEditing(loan.id);
    setName(loan.name);
    setInterestRate(loan.interest_rate || 0);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this loan?")) return;
    try {
      await apiDelete(`/manager/loans/${id}`);
      fetchLoans();
    } catch (err) {
      alert(err.message || "Failed to delete loan");
    }
  };

  return (
    <div>
      <h2>Manage Loans (CRUD)</h2>
      <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 15, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
          <div className="form-group">
            <label>Loan Name</label>
            <input 
              type="text"
              placeholder="Enter loan name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Interest Rate (%)</label>
            <input 
              placeholder="Enter interest rate" 
              type="number" 
              step="0.01" 
              value={interestRate} 
              onChange={(e) => setInterestRate(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn" type="submit" disabled={loading} style={{ width: 'auto', padding: '12px 24px' }}>
            {editing ? "Update Loan" : "Create Loan"}
          </button>
          {editing && (
            <button 
              type="button" 
              onClick={() => { setEditing(null); setName(""); setInterestRate(0); }}
              style={{ width: 'auto', padding: '12px 24px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? <div>Loading...</div> : (
        <div style={{ display: 'grid', gap: 10 }}>
          {loans.map(l => (
            <div key={l.id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{l.name}</strong>
                <div>Interest: {l.interest_rate}%</div>
                <div>Active: {l.is_active ? 'Yes' : 'No'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => startEdit(l)} style={{ width: 'auto', padding: '8px 16px' }}>Edit</button>
                <button className="btn" onClick={() => handleDelete(l.id)} style={{ background: '#dc3545', width: 'auto', padding: '8px 16px' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
