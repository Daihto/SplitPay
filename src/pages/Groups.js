import React from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Groups() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">SplitPay</div>

        <nav className="sidebar-menu">
          <button className="sidebar-item" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
          <button className="sidebar-item active" onClick={() => navigate("/groups")}>
            My Groups
          </button>
          <button className="sidebar-item" onClick={() => navigate("/expenses")}>
            Expenses
          </button>
          <button className="sidebar-item" onClick={() => navigate("/activity")}>
            Activity
          </button>
          <button className="sidebar-item" onClick={() => navigate("/profile")}>
            Profile
          </button>
        </nav>
      </aside>

      <div className="dashboard-content">
        <header className="topbar">
          <div>
            <h1>My Groups</h1>
            <p>View and manage your expense groups.</p>
          </div>
        </header>

        <div className="panel">
          <h3>Groups Page</h3>
          <p>Your groups will appear here.</p>
        </div>
      </div>
    </div>
  );
}

export default Groups;