import React, { useContext, useMemo } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { SplitPayContext } from "../context/SplitPayContext";

function Profile() {
  const navigate = useNavigate();
  const { user, groups, logout, expenses } = useContext(SplitPayContext);

  const myGroups = useMemo(
    () => groups.filter((g) => g.members.includes(user?.username)),
    [groups, user]
  );

  const groupIds = useMemo(() => myGroups.map((g) => g.id), [myGroups]);

  const { youOwe, youAreOwed } = useMemo(() => {
    let owe = 0;
    let owed = 0;

    expenses
      .filter((exp) => groupIds.includes(exp.groupId))
      .forEach((exp) => {
        if (!Array.isArray(exp.splitAmong) || exp.splitAmong.length === 0) return;
        const share = exp.amount / exp.splitAmong.length;

        exp.splitAmong.forEach((member) => {
          if (member === user) return;
          if (exp.paidBy === user) {
            owed += share;
          } else if (member === user && exp.paidBy !== user) {
            owe += share;
          }
        });
      });

    return { youOwe: Math.max(0, owe), youAreOwed: Math.max(0, owed) };
  }, [expenses, groupIds, user]);

  const totalBalance = useMemo(() => youAreOwed - youOwe, [youAreOwed, youOwe]);

  const formatCurrency = (value) => `₱${Number(value || 0).toFixed(2)}`;

  const handleLogout = () => {
    logout();
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
            <BackButton />
            <h1>Profile</h1>
            <p>Manage your account settings here.</p>
          </div>
        </header>

        <div className="panel">
          <h3>User Profile</h3>
          <p>Username: <strong>{user || "—"}</strong></p>
          <p>Groups joined: <strong>{myGroups.length}</strong></p>

          <div className="summary-cards" style={{ marginTop: 18 }}>
            <div className="summary-card red">
              <p>You Owe</p>
              <h2>{formatCurrency(youOwe)}</h2>
            </div>
            <div className="summary-card green">
              <p>You Are Owed</p>
              <h2>{formatCurrency(youAreOwed)}</h2>
            </div>
            <div className="summary-card teal">
              <p>Total Balance</p>
              <h2>{formatCurrency(totalBalance)}</h2>
            </div>
          </div>

          <h4 style={{ marginTop: 18 }}>Groups</h4>
          {myGroups.length === 0 ? (
            <p style={{ opacity: 0.75 }}>
              Join or create a group to start splitting expenses.
            </p>
          ) : (
            <div className="group-list">
              {myGroups.map((group) => (
                <div key={group.id} className="group-item">
                  <div>
                    <strong>{group.name}</strong>
                    <p>{group.members.length} members</p>
                  </div>
                  <span className="tag">{group.id}</span>
                </div>
              ))}
            </div>
          )}

          <button className="solid-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;