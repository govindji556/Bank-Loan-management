import React, { useState } from "react";
import Collapsible from "./Collapsible";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);
      const response = await fetch("http://localhost:8000/users/login", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        onLogin({ email: data.email, id: data.id, name: data.name, userType: userType });
      } else {
        setError(data.detail || "Login failed");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="alert error">{error}</div>}
        
        <Collapsible title="Select User Type">
          <div style={{ padding: "15px", display: "flex", gap: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="radio"
                name="userType"
                value="user"
                checked={userType === "user"}
                onChange={(e) => setUserType(e.target.value)}
                style={{ marginRight: "8px" }}
              />
              Regular User
            </label>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="radio"
                name="userType"
                value="manager"
                checked={userType === "manager"}
                onChange={(e) => setUserType(e.target.value)}
                style={{ marginRight: "8px" }}
              />
              Manager
            </label>
          </div>
        </Collapsible>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
