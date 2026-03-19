import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getApiErrorMessage,
  uploadUserAvatar,
  updateUserPassword,
  updateUserProfile
} from "../api/apiService";

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
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

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

  function handlePasswordChange(event) {
    const { name, value } = event.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  }

  function getAvatarUrl(user) {
    return user?.avatarUrl || user?.avatar_url || user?.photoUrl || user?.imageUrl || "";
  }

  function logAvatarDebug(label, value) {
    if (import.meta.env.DEV) {
      console.debug(`[AvatarDebug] ${label}:`, value);
    }
  }

  function getNameInitial(value) {
    return value?.trim()?.charAt(0)?.toUpperCase() || "U";
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

  function resetPasswordForm() {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  }

  function handleAvatarFileChange(event) {
    const file = event.target.files?.[0] || null;
    setAvatarError("");
    setAvatarSuccess("");

    if (!file) {
      setSelectedAvatarFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select a valid image file.");
      setSelectedAvatarFile(null);
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setAvatarError("Image size must be 5MB or less.");
      setSelectedAvatarFile(null);
      return;
    }

    setSelectedAvatarFile(file);
  }

  useEffect(() => {
    const avatarUrlInState = getAvatarUrl(currentUser);
    logAvatarDebug("avatarUrl in state", avatarUrlInState);
    setAvatarLoadFailed(false);
  }, [currentUser]);

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
      let responseUser = null;
      if (currentUser.id) {
        responseUser = await updateUserProfile(currentUser.id, {
          name,
          email,
          avatarUrl: getAvatarUrl(currentUser) || null
        });
      }

      const mergedUser = {
        ...updatedUser,
        ...(responseUser || {})
      };
      localStorage.setItem("splitpayUser", JSON.stringify(mergedUser));
      setCurrentUser(mergedUser);
      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Unable to update profile."));
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSave(event) {
    event.preventDefault();

    if (!currentUser?.id) {
      setPasswordError("Your account could not be identified. Please log in again.");
      return;
    }

    const currentPassword = passwordData.currentPassword.trim();
    const newPassword = passwordData.newPassword.trim();
    const confirmPassword = passwordData.confirmPassword.trim();

    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordError("New password must include at least one letter and one number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from your current password.");
      return;
    }

    setPasswordLoading(true);

    try {
      await updateUserPassword(currentUser.id, {
        currentPassword,
        newPassword
      });

      resetPasswordForm();
      setPasswordSuccess("Password updated successfully.");
    } catch (apiError) {
      setPasswordError(getApiErrorMessage(apiError, "Unable to update password."));
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleAvatarUpload(event) {
    event.preventDefault();

    if (!currentUser?.id) {
      setAvatarError("Your account could not be identified. Please log in again.");
      return;
    }

    if (!selectedAvatarFile) {
      setAvatarError("Please choose an image to upload.");
      return;
    }

    setAvatarLoading(true);
    setAvatarError("");
    setAvatarSuccess("");

    try {
      const response = await uploadUserAvatar(currentUser.id, selectedAvatarFile);
      const avatarUrl = response?.avatarUrl;
      logAvatarDebug("avatarUrl from API response", avatarUrl);

      if (!avatarUrl) {
        setAvatarError("Upload succeeded but no avatar URL was returned.");
        return;
      }

      const updatedUser = {
        ...currentUser,
        avatarUrl
      };

      localStorage.setItem("splitpayUser", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setAvatarLoadFailed(false);
      setSelectedAvatarFile(null);
      setAvatarSuccess("Profile photo updated successfully.");
    } catch (apiError) {
      setAvatarError(getApiErrorMessage(apiError, "Unable to upload profile photo."));
    } finally {
      setAvatarLoading(false);
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

      <section className="card card--form profile-editor profile-editor--avatar">
        <div className="section-title-with-action">
          <h2>Profile Photo</h2>
        </div>

        <div className="profile-avatar-block">
          <div className="profile-avatar-preview" aria-hidden="true">
            {getAvatarUrl(currentUser) && !avatarLoadFailed ? (
              <img
                src={getAvatarUrl(currentUser)}
                alt="Profile"
                onLoad={() => {
                  logAvatarDebug("final img src", getAvatarUrl(currentUser));
                }}
                onError={(event) => {
                  setAvatarLoadFailed(true);
                  logAvatarDebug("image load failed for src", event.currentTarget.currentSrc || getAvatarUrl(currentUser));
                }}
              />
            ) : (
              <span>{getNameInitial(currentUser?.name)}</span>
            )}
          </div>

          <form className="profile-avatar-form" onSubmit={handleAvatarUpload}>
            <label htmlFor="avatarFile">Choose a photo</label>
            <input
              id="avatarFile"
              name="avatarFile"
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              disabled={avatarLoading}
            />

            {avatarError ? <p className="feedback feedback--error">{avatarError}</p> : null}
            {avatarSuccess ? <p className="feedback feedback--success">{avatarSuccess}</p> : null}

            <div className="quick-actions__buttons">
              <button className="button" type="submit" disabled={avatarLoading}>
                {avatarLoading ? "Uploading..." : "Upload Photo"}
              </button>
              <button
                className="button button--secondary"
                type="button"
                disabled={avatarLoading}
                onClick={() => {
                  setSelectedAvatarFile(null);
                  setAvatarError("");
                  setAvatarSuccess("");
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="card card--form profile-editor profile-editor--password">
        <div className="section-title-with-action">
          <h2>Security</h2>
        </div>

        <form className="stack-form" onSubmit={handlePasswordSave}>
          <div className="profile-meta-grid">
            <div className="profile-meta-card">
              <p className="profile-meta-label">Password</p>
              <p className="profile-meta-value">Protected</p>
            </div>
            <div className="profile-meta-card">
              <p className="profile-meta-label">Requirement</p>
              <p className="profile-meta-value">8+ chars with letters and numbers</p>
            </div>
          </div>

          <div className="password-grid">
            <div>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                disabled={passwordLoading}
                autoComplete="current-password"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                minLength={8}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                disabled={passwordLoading}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={8}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              disabled={passwordLoading}
              autoComplete="new-password"
              required
            />
          </div>

          {passwordError ? <p className="feedback feedback--error">{passwordError}</p> : null}
          {passwordSuccess ? <p className="feedback feedback--success">{passwordSuccess}</p> : null}

          <div className="quick-actions__buttons">
            <button className="button" type="submit" disabled={passwordLoading}>
              {passwordLoading ? "Updating..." : "Change Password"}
            </button>
            <button
              className="button button--secondary"
              type="button"
              disabled={passwordLoading}
              onClick={() => {
                resetPasswordForm();
                setPasswordError("");
                setPasswordSuccess("");
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProfilePage;
