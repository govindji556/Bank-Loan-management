import React from "react";

function UserDashboard({ username }) {
  return (
    <div className="dashboard">
      <h2>👋 Welcome, {username}</h2>
      
      <div style={{ background: '#f0f4ff', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <p style={{ color: '#667eea', fontWeight: '600', marginBottom: '10px' }}>
          You are logged in as a User
        </p>
        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
          You can submit loan requests and track their status here. Visit the loan application section to get started.
        </p>
      </div>

      <button 
        style={{ 
          marginTop: '30px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => alert('Loan application form would open here')}
      >
        Apply for Loan
      </button>
    </div>
  );
}

export default UserDashboard;
