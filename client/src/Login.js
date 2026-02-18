import React, { useState } from "react";

function Login({ setRole, setUsername }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        setRole(data.role);
        setUsername(form.username);
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="card">
      <h2>🔐 Login</h2>

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

      <input
        type="text"
        placeholder="Username"
        value={form.username}
        onChange={(e) => {
          setForm({ ...form, username: e.target.value });
          setError("");
        }}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => {
          setForm({ ...form, password: e.target.value });
          setError("");
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
        onClick={handleLogin}
        disabled={loading}
        style={{
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

export default Login;
