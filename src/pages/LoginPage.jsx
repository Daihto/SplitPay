import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import splitpayAtmosphere from "../assets/splitpay-atmosphere.svg";
import { getApiErrorMessage, loginUser } from "../api/apiService";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser(formData);

      localStorage.setItem(
        "splitpayUser",
        JSON.stringify({
          id: result.user?.id ?? result.id,
          name: result.user?.name ?? result.name ?? "User",
          email: result.user?.email ?? result.email ?? formData.email,
          token: result.token
        })
      );

      navigate("/dashboard");
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Login failed."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-fullscreen auth-fullscreen--login">
      <section className="auth-fullscreen__visual">
        <img
          className="auth-fullscreen__visual-art"
          src={splitpayAtmosphere}
          alt=""
          aria-hidden="true"
        />
        <div className="auth-fullscreen__visual-layer" />
        <div className="auth-fullscreen__visual-haze" />
        <div className="auth-fullscreen__visual-content">
          <p className="auth-fullscreen__eyebrow">SPLITPAY</p>
          <h1>Split expenses without the stress.</h1>
          <p>
            Manage shared bills, see balances clearly, and keep track of who
            paid and who still owes.
          </p>

          <div className="auth-fullscreen__badges">
            <span>Simple tracking</span>
            <span>Group expenses</span>
            <span>Clear balances</span>
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
            <button type="button" className="active">
              Login
            </button>
            <Link to="/register">Sign Up</Link>
          </div>
        </div>

        <form className="auth-fullscreen__form" onSubmit={handleSubmit}>
          <div className="auth-fullscreen__heading">
            <h2>Welcome back</h2>
            <p>Login to continue to your dashboard.</p>
          </div>

          <div className="auth-fullscreen__field">
            <label htmlFor="email">Email</label>
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

          <div className="auth-fullscreen__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-fullscreen__meta">
            <span>Forgot password?</span>
          </div>

          {error ? <p className="feedback feedback--error">{error}</p> : null}

          <button
            className="auth-fullscreen__submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="auth-fullscreen__bottom">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;