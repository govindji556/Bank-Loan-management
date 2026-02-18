import React, { useState } from "react";

function Signup() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("✓ Account created successfully! Please log in.");
        setForm({ username: "", password: "", role: "user" });
      } else {
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSignup();
  };

  return (
    <div className="card">
      <h2>✨ Sign Up</h2>

      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '13px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: '#d4edda',
          color: '#155724',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '13px',
          border: '1px solid #c3e6cb'
        }}>
          {success}
        </div>
      )}

      <input
        type="text"
        placeholder="Choose Username"
        value={form.username}
        onChange={(e) => {
          setForm({ ...form, username: e.target.value });
          setError("");
          setSuccess("");
        }}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />

      <input
        type="password"
        placeholder="Create Password (min. 6 chars)"
        value={form.password}
        onChange={(e) => {
          setForm({ ...form, password: e.target.value });
          setError("");
          setSuccess("");
        }}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />

      <select
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        disabled={loading}
      >
        <option value="user">👤 User</option>
        <option value="manager">👨‍💼 Manager</option>
      </select>

      <button 
        onClick={handleSignup}
        disabled={loading}
        style={{
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </div>
  );
}

export default Signup;
