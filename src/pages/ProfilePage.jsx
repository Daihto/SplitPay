import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUserProfile } from "../api/apiService";

function ProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("splitpayUser"));
    } catch {
      return null;
    }
  });
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setFormData({
      name: currentUser.name || "",
      email: currentUser.email || ""
    });
  }, [currentUser, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleCancel() {
    setFormData({
      name: currentUser?.name || "",
      email: currentUser?.email || ""
    });
    setError("");
    setSuccess("");
    setEditing(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!currentUser) {
      return;
    }

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name || !email) {
      setError("Name and email are required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const updatedUser = {
      ...currentUser,
      name,
      email
    };

    try {
      if (currentUser.id) {
        await updateUserProfile(currentUser.id, { name, email });
      }

      localStorage.setItem("splitpayUser", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch {
      // Keep UX unblocked if profile endpoint is missing in backend.
      localStorage.setItem("splitpayUser", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setSuccess("Profile saved locally. Backend profile sync is currently unavailable.");
      setEditing(false);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("splitpayUser");
    navigate("/login");
  }

  return (
    <div className="page-content">
      <section className="hero-card hero-card--compact">
        <p className="hero-card__eyebrow">PROFILE</p>
        <h1>Account Center</h1>
        <p className="hero-card__text">
          Edit your identity details, keep account info current, and securely
          sign out when needed.
        </p>
      </section>

      <section className="card card--form profile-editor">
        <div className="section-title-with-action">
          <h2>Account Information</h2>
          {!editing ? (
            <button
              className="button button--secondary"
              type="button"
              onClick={() => {
                setEditing(true);
                setError("");
                setSuccess("");
              }}
            >
              Edit Profile
            </button>
          ) : null}
        </div>

        <form className="stack-form" onSubmit={handleSave}>
          <div className="profile-meta-grid">
            <div className="profile-meta-card">
              <p className="profile-meta-label">User ID</p>
              <p className="profile-meta-value">{currentUser?.id || "Not available"}</p>
            </div>
            <div className="profile-meta-card">
              <p className="profile-meta-label">Status</p>
              <p className="profile-meta-value">{editing ? "Editing" : "Stable"}</p>
            </div>
          </div>

          <div>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={!editing || loading}
              required
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!editing || loading}
              required
            />
          </div>

          {error ? <p className="feedback feedback--error">{error}</p> : null}
          {success ? <p className="feedback feedback--success">{success}</p> : null}

          <div className="quick-actions__buttons">
            {editing ? (
              <>
                <button className="button" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={loading}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button className="button" type="button" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProfilePage;
