import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import splitpayAtmosphere from "../assets/splitpay-atmosphere.svg";
import { getApiErrorMessage, loginUser } from "../api/apiService";

function normalizeLoginResult(result, fallbackEmail) {
  const nestedUser = result?.user || result?.data?.user || {};

  const id = nestedUser.id ?? result?.id ?? result?.userId ?? result?.user_id ?? result?.uid;
  const name = nestedUser.name ?? result?.name ?? result?.fullName ?? result?.full_name ?? "User";
  const email = nestedUser.email ?? result?.email ?? fallbackEmail;
  const token = result?.token ?? result?.accessToken ?? result?.access_token;

  return {
    id,
    name,
    email,
    token
  };
}

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
      const normalizedUser = normalizeLoginResult(result, formData.email);

      if (!normalizedUser.token) {
        setError("Login succeeded but no auth token was returned. Please contact backend support.");
        return;
      }

      localStorage.setItem(
        "splitpayUser",
        JSON.stringify(normalizedUser)
      );

      navigate("/dashboard");
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Login failed."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-fullscreen auth-fullscreen--login auth-fullscreen--premium">
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
          <p className="auth-fullscreen__eyebrow">SPLITPAY</p>
          <h1>Finance clarity for every shared payment.</h1>
          <p>
            Manage shared bills, settle faster, and track every split with the
            confidence of a modern fintech dashboard.
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
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