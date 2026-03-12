import React from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Activity() {
  const navigate = useNavigate();

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
          <button className="sidebar-item active" onClick={() => navigate("/activity")}>
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
            <h1>Activity</h1>
            <p>See your latest SplitPay activity here.</p>
          </div>
        </header>

        <div className="panel">
          <h3>Activity Page</h3>
          <p>Recent group actions, expenses, and settlements will appear here.</p>
        </div>
      </div>
    </div>
  );
}

export default Activity;