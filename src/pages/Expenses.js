import React from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Expenses() {
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
          <button className="sidebar-item active" onClick={() => navigate("/expenses")}>
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
            <h1>Expenses</h1>
            <p>Track and manage all expenses here.</p>
          </div>
        </header>

        <div className="panel">
          <h3>Expenses Page</h3>
          <p>Your expense list and add-expense form will go here.</p>
        </div>
      </div>
    </div>
  );
}

export default Expenses;