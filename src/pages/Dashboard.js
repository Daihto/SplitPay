import React from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">SplitPay</div>

        <nav className="sidebar-menu">
          <button
            className="sidebar-item active"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigate("/groups")}
          >
            My Groups
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigate("/expenses")}
          >
            Expenses
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigate("/activity")}
          >
            Activity
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>
        </nav>
      </aside>

      <div className="dashboard-content">
        <header className="topbar">
          <div>
            <h1>Welcome back, User!</h1>
            <p>Track balances and recent group expenses in one place.</p>
          </div>

          <div className="topbar-actions">
            <button className="ghost-btn" onClick={() => navigate("/groups")}>
              + New Group
            </button>

            <button className="solid-btn" onClick={() => navigate("/expenses")}>
              + Add Expense
            </button>
          </div>
        </header>

        <section className="summary-cards">
          <div className="summary-card red">
            <p>You Owe</p>
            <h2>₱230.89</h2>
            <span>Your pending balances</span>
          </div>

          <div className="summary-card green">
            <p>You Are Owed</p>
            <h2>₱860.00</h2>
            <span>Expected from members</span>
          </div>

          <div className="summary-card teal">
            <p>Total Balance</p>
            <h2>₱700.00</h2>
            <span>Your net standing</span>
          </div>
        </section>

        <section className="dashboard-panels">
          <div className="panel panel-wide">
            <div className="panel-top">
              <h3>Recent Expenses</h3>
              <button
                className="mini-btn"
                onClick={() => navigate("/expenses")}
              >
                View All
              </button>
            </div>

            <div className="expense-header">
              <span>Expense</span>
              <span>Paid By</span>
              <span>Amount</span>
              <span>Date</span>
              <span>Group</span>
            </div>

            <div className="expense-row">
              <span>Dinner at Italian Place</span>
              <span>John Smith</span>
              <span>$145.50</span>
              <span>Today</span>
              <span className="tag">Apartment</span>
            </div>

            <div className="expense-row">
              <span>Grocery Split</span>
              <span>Martin</span>
              <span>$85.20</span>
              <span>Yesterday</span>
              <span className="tag">Roommates</span>
            </div>

            <div className="expense-row">
              <span>Internet Bill</span>
              <span>Sarah Lee</span>
              <span>$50.00</span>
              <span>Mar 10</span>
              <span className="tag">Apartment</span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-top">
              <h3>Quick Actions</h3>
            </div>

            <div className="quick-grid">
              <button onClick={() => navigate("/groups")}>Create Group</button>
              <button onClick={() => navigate("/expenses")}>Add Expense</button>
              <button onClick={() => navigate("/activity")}>Settle Balance</button>
              <button onClick={() => navigate("/activity")}>View Activity</button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-top">
              <h3>My Groups</h3>
              <button
                className="mini-btn"
                onClick={() => navigate("/groups")}
              >
                Manage
              </button>
            </div>

            <div className="group-item">
              <div>
                <strong>Apartment</strong>
                <p>4 members</p>
              </div>
              <span className="negative">- $120</span>
            </div>

            <div className="group-item">
              <div>
                <strong>Project Team</strong>
                <p>5 members</p>
              </div>
              <span className="positive">+ $450</span>
            </div>

            <div className="group-item">
              <div>
                <strong>Weekend Trip</strong>
                <p>3 members</p>
              </div>
              <span className="positive">+ $370</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;