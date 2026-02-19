import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import ManagerDashboard from "./ManagerDashboard";
import UserDashboard from "./UserDashboard";
import ProtectedRoute from "./ProtectedRoute";
import "./styles.css";

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    // Clear access token from localStorage
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={setUser} />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            {user?.role === "manager" ? (
              <ManagerDashboard user={user} onLogout={handleLogout} />
            ) : (
              <UserDashboard user={user} onLogout={handleLogout} />
            )}
          </ProtectedRoute>
        }
      />
      
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
