import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Collapsible from "./Collapsible";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("user");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Email validation
  const isValidEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  // Password strength validation
  const isStrongPassword = (passwordValue) => {
    return (
      passwordValue.length >= 8 &&
      /[A-Z]/.test(passwordValue) &&
      /[a-z]/.test(passwordValue) &&
      /[0-9]/.test(passwordValue)
    );
  };

  // Name validation
  const isValidName = (nameValue) => {
    return nameValue.trim().length >= 2 && !/[0-9]/.test(nameValue);
  };

  // Validate fields before submission
  const validateFields = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!name.trim()) {
      errors.name = "Full name is required";
    } else if (!isValidName(name)) {
      errors.name = "Name must be at least 2 characters and contain no numbers";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Password must contain at least one number";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateFields()) {
      return;
    }

    setLoading(true);

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
        setConfirmPassword("");
        setUserType("user");
        setFieldErrors({});
        setTimeout(() => navigate("/login"), 1500);
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors({ ...fieldErrors, email: "" });
                }
              }}
              placeholder="Enter your email"
              disabled={loading}
            />
            {fieldErrors.email && <span style={{ color: "#d32f2f", fontSize: "0.875rem", marginTop: "4px" }}>{fieldErrors.email}</span>}
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors({ ...fieldErrors, name: "" });
                }
              }}
              placeholder="Enter your full name"
              disabled={loading}
            />
            {fieldErrors.name && <span style={{ color: "#d32f2f", fontSize: "0.875rem", marginTop: "4px" }}>{fieldErrors.name}</span>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors({ ...fieldErrors, password: "" });
                }
              }}
              placeholder="Min 8 chars, uppercase, lowercase, number"
              disabled={loading}
            />
            {fieldErrors.password && <span style={{ color: "#d32f2f", fontSize: "0.875rem", marginTop: "4px" }}>{fieldErrors.password}</span>}
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                }
              }}
              placeholder="Re-enter your password"
              disabled={loading}
            />
            {fieldErrors.confirmPassword && <span style={{ color: "#d32f2f", fontSize: "0.875rem", marginTop: "4px" }}>{fieldErrors.confirmPassword}</span>}
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <p className="toggle-link" style={{ textAlign: "center", color: "#667eea", marginTop: "20px" }}>
          Already have an account? <Link to="/login" style={{ cursor: "pointer", fontWeight: "600", textDecoration: "none", color: "#667eea" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
