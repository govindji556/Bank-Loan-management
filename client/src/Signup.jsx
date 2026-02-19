import React, { useState } from "react";
import Collapsible from "./Collapsible";

export default function Signup({ onSignup }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !name || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/users/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, name, password, role: userType }),
      });

      if (response.ok) {
        setEmail("");
        setName("");
        setPassword("");
        setUserType("user");
        setTimeout(() => onSignup(), 1500);
      } else {
        const data = await response.json();
        setError(data.detail || "Signup failed");
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
        <h2>Sign Up</h2>
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

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
