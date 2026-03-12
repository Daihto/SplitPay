import React, { useState } from "react";
import "./Register.css";
import { registerUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const validateRegister = () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return "Please complete all fields.";
    }

    if (username.trim().length < 3) {
      return "Username must be at least 3 characters.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const validationError = validateRegister();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const result = await registerUser(username.trim(), password);

    if (result === "Success") {
      navigate("/dashboard");
    } else {
      setErrorMessage(result || "Registration failed.");
    }
  };

  return (
    <div className="register-shell">
      <div className="register-left">
        <div className="register-left-overlay" />

        <div className="register-brand">SplitPay</div>

        <div className="register-copy">
          <p className="register-tag">CREATE YOUR ACCOUNT</p>
          <h1>Join your group and start managing shared costs today.</h1>
          <p className="register-description">
            Create your account to access your dashboard, groups, expenses, and
            settlement history in one place.
          </p>

          <div className="register-pills">
            <span>Quick Signup</span>
            <span>Clean Dashboard</span>
            <span>Group Expense Control</span>
          </div>
        </div>
      </div>

      <div className="register-right">
        <div className="register-card">
          <div className="register-header">
            <h2>Create Account</h2>
            <p>Set up your SplitPay profile to get started.</p>
          </div>

          <form onSubmit={handleRegister} className="register-form">
            <div className="register-field">
              <label>Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
              />
            </div>

            <div className="register-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
              />
            </div>

            <div className="register-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
              />
            </div>

            <div className="register-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
              />
            </div>

            {errorMessage && (
              <div className="register-error-box">{errorMessage}</div>
            )}

            <button type="submit" className="register-main-btn">
              Create Account
              <span>→</span>
            </button>
          </form>

          <div className="register-footer">
            Already have an account? <Link to="/">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;