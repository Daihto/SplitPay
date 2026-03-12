import React, { useState } from "react";
import "./Login.css";
import { loginUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const validateLogin = () => {
    if (!username.trim() && !password.trim()) {
      return "Username and password are required.";
    }

    if (!username.trim()) {
      return "Username is required.";
    }

    if (!password.trim()) {
      return "Password is required.";
    }

    if (username.trim().length < 3) {
      return "Username must be at least 3 characters.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return "";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const validationError = validateLogin();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const result = await loginUser(username.trim(), password);

    if (result === "Success") {
      navigate("/dashboard");
    } else {
      setErrorMessage(result || "Invalid username or password.");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="auth-left-overlay" />

        <div className="brand">SplitPay</div>

        <div className="left-content">
          <p className="left-tag">SMART EXPENSE TRACKING</p>
          <h1>Split expenses with your group in a simple, modern way.</h1>
          <p className="left-description">
            Track shared bills, view balances, and manage settlements with a
            clean dashboard built for friends, roommates, and teams.
          </p>

          <div className="left-links">
            <span>Group Tracking</span>
            <span>Balance Summary</span>
            <span>Easy Settlements</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Existing Member</h2>
            <p>Welcome back! Please login to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="field">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
              />
            </div>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <button type="submit" className="main-btn">
              Continue
              <span>→</span>
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="auth-footer">
            Don&apos;t have an account? <Link to="/register">Register now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;