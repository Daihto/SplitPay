import React from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">SplitPay</div>

        <nav className="sidebar-menu">
          <button className="sidebar-item" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
          <button className="sidebar-item" onClick={() => navigate("/groups")}>
            My Groups
          </button>
          <button className="sidebar-item" onClick={() => navigate("/expenses")}>
            Expenses
          </button>
          <button className="sidebar-item" onClick={() => navigate("/activity")}>
            Activity
          </button>
          <button className="sidebar-item active" onClick={() => navigate("/profile")}>
            Profile
          </button>
        </nav>
      </aside>

      <div className="dashboard-content">
        <header className="topbar">
          <div>
            <h1>Profile</h1>
            <p>Manage your account settings here.</p>
          </div>
        </header>

        <div className="panel">
          <h3>User Profile</h3>
          <p>Username: User</p>

          <button className="solid-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;