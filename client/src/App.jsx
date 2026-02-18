import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import ManagerDashboard from "./ManagerDashboard";
import UserDashboard from "./UserDashboard";
import "./styles.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);

  const handleLogout = () => {
    setUser(null);
    setIsSignup(false);
  };

  if (user) {
    return user.role === "manager" ? (
      <ManagerDashboard user={user} onLogout={handleLogout} />
    ) : (
      <UserDashboard user={user} onLogout={handleLogout} />
    );
  }

  return isSignup ? (
    <div>
      <Signup onSignup={() => setIsSignup(false)} />
      <p className="toggle-link" style={{ textAlign: "center", color: "#667eea", marginTop: "20px" }}>
        Already have an account? <span style={{ cursor: "pointer", fontWeight: "600" }} onClick={() => setIsSignup(false)}>Login</span>
      </p>
    </div>
  ) : (
    <div>
      <Login onLogin={(user) => setUser(user)} />
      <p className="toggle-link" style={{ textAlign: "center", color: "#667eea", marginTop: "20px" }}>
        Don't have an account? <span style={{ cursor: "pointer", fontWeight: "600" }} onClick={() => setIsSignup(true)}>Sign Up</span>
      </p>
    </div>
  );
}
