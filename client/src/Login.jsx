import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "./services/apiService.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Email validation
  const isValidEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  // Validate fields before submission
  const validateFields = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateFields()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);
      const data = await apiPost("/auth/login", formData, true);

      // Store access token in localStorage
      if (data.access_token) {
        localStorage.setItem("accessToken", data.access_token);
      }

      // Determine user profile: either returned directly or fetched from /auth/me
      let userProfile = null;
      if (data.email || data.id || data.role) {
        userProfile = {
          email: data.email,
          id: data.id,
          name: data.name,
          role: data.role,
        };
      } else {
        // fetch profile using saved token
        try {
          const { apiGet } = await import("./services/apiService.js");
          userProfile = await apiGet("/users/me");
        } catch (err) {
          // if profile fetch fails, clear token and show error
          localStorage.removeItem("accessToken");
          throw new Error("Failed to fetch user profile");
        }
      }

      // persist and set user
      localStorage.setItem("user", JSON.stringify(userProfile));
      onLogin(userProfile);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleLogin}>
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
              placeholder="Enter your password"
              disabled={loading}
            />
            {fieldErrors.password && <span style={{ color: "#d32f2f", fontSize: "0.875rem", marginTop: "4px" }}>{fieldErrors.password}</span>}
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="toggle-link" style={{ textAlign: "center", color: "#667eea", marginTop: "20px" }}>
          Don't have an account? <Link to="/signup" style={{ cursor: "pointer", fontWeight: "600", textDecoration: "none", color: "#667eea" }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
