import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import splitpayAtmosphere from "../assets/splitpay-atmosphere.svg";
import { getApiErrorMessage, registerUser } from "../api/apiService";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const passwordsReady = formData.password && formData.confirmPassword;
  const passwordsMatch = formData.password === formData.confirmPassword;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please confirm your password.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      await registerUser(payload);
      setSuccess("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Registration failed."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-fullscreen auth-fullscreen--register auth-fullscreen--premium">
      <section className="auth-fullscreen__visual">
        <img
          className="auth-fullscreen__visual-art"
          src={splitpayAtmosphere}
          alt=""
          aria-hidden="true"
        />
        <div className="auth-fullscreen__blob auth-fullscreen__blob--one" />
        <div className="auth-fullscreen__blob auth-fullscreen__blob--two" />
        <div className="auth-fullscreen__blob auth-fullscreen__blob--three" />
        <div className="auth-fullscreen__visual-layer" />
        <div className="auth-fullscreen__visual-haze" />
        <div className="auth-fullscreen__visual-content">
          <p className="auth-fullscreen__eyebrow">CREATE ACCOUNT</p>
          <h1>Build your shared wallet with premium control.</h1>
          <p>
            Create groups, automate split tracking, and stay in control of
            who owes what with clean financial visibility.
          </p>

          <div className="auth-fullscreen__badges">
            <span>Fast setup</span>
            <span>Clean interface</span>
            <span>Easy to use</span>
          </div>
        </div>
      </section>

      <section className="auth-fullscreen__form-side">
        <div className="auth-fullscreen__topbar">
          <div className="auth-fullscreen__brand">
            <div className="auth-fullscreen__brand-mark" />
            <span>SplitPay</span>
          </div>

          <div className="auth-fullscreen__switch">
            <Link to="/login">Login</Link>
            <button type="button" className="active">
              Sign Up
            </button>
          </div>
        </div>

        <form className="auth-fullscreen__form" onSubmit={handleSubmit}>
          <div className="auth-fullscreen__heading">
            <h2>Create account</h2>
            <p>Set up your profile and start splitting today.</p>
          </div>

          <div className="auth-fullscreen__field">
            <label htmlFor="name">Name</label>
            <div className="auth-fullscreen__input-wrap">
              <span className="auth-fullscreen__field-icon" aria-hidden="true">U</span>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-fullscreen__field">
            <label htmlFor="email">Email</label>
            <div className="auth-fullscreen__input-wrap">
              <span className="auth-fullscreen__field-icon" aria-hidden="true">@</span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-fullscreen__field">
            <label htmlFor="password">Password</label>
            <div className="auth-fullscreen__input-wrap">
              <span className="auth-fullscreen__field-icon" aria-hidden="true">#</span>
              <input
                id="password"
                name="password"
                type="password"
                minLength={6}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-fullscreen__field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="auth-fullscreen__input-wrap">
              <span className="auth-fullscreen__field-icon" aria-hidden="true">#</span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                minLength={6}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <p
            className={`auth-fullscreen__hint ${
              passwordsReady ? (passwordsMatch ? "is-match" : "is-mismatch") : ""
            }`}
          >
            {passwordsReady
              ? passwordsMatch
                ? "Passwords match"
                : "Passwords must match"
              : "Use at least 6 characters for a safer password"}
          </p>

          {error ? <p className="feedback feedback--error">{error}</p> : null}
          {success ? <p className="feedback feedback--success">{success}</p> : null}

          <button
            className="auth-fullscreen__submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p className="auth-fullscreen__bottom">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </div>
  );
}

export default RegisterPage;