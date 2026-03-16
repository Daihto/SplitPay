import React, { useContext, useMemo } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { SplitPayContext } from "../context/SplitPayContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user, groups, expenses, activities } = useContext(SplitPayContext);

  const userGroups = useMemo(
    () => groups.filter((group) => group.members.includes(user?.username)),
    [groups, user]
  );

  const groupIds = useMemo(() => userGroups.map((g) => g.id), [userGroups]);

  const groupMap = useMemo(
    () => Object.fromEntries(groups.map((g) => [g.id, g])),
    [groups]
  );

  const unsettledExpenses = useMemo(
    () => expenses.filter((e) => groupIds.includes(e.groupId) && !e.isSettled),
    [expenses, groupIds]
  );

  const { youOwe, youAreOwed } = useMemo(() => {
    let totalPaidByUser = 0;
    let totalUserShare = 0;

    unsettledExpenses.forEach((exp) => {
      if (!Array.isArray(exp.splitAmong) || exp.splitAmong.length === 0) return;
      const share = exp.amount / exp.splitAmong.length;

      if (exp.paidBy === user) {
        totalPaidByUser += exp.amount;
      }

      if (exp.splitAmong?.includes(user?.username)) {
        totalUserShare += share;
      }
    });

    const net = totalPaidByUser - totalUserShare;

    return {
      youAreOwed: Math.max(0, net),
      youOwe: Math.max(0, -net),
    };
  }, [unsettledExpenses, user]);

  const totalBalance = useMemo(() => youAreOwed - youOwe, [youAreOwed, youOwe]);

  const groupBalances = useMemo(() => {
    const balances = {};
    userGroups.forEach((group) => {
      balances[group.id] = 0;
    });

    unsettledExpenses.forEach((exp) => {
      if (!Array.isArray(exp.splitAmong) || exp.splitAmong.length === 0) return;
      const share = exp.amount / exp.splitAmong.length;
      if (!balances.hasOwnProperty(exp.groupId)) return;

      exp.splitAmong.forEach((member) => {
        if (member === user?.username) return;
        if (exp.paidBy === user?.username) {
          balances[exp.groupId] += share;
        } else if (member === user?.username && exp.paidBy !== user?.username) {
          balances[exp.groupId] -= share;
        }
      });
    });

    return balances;
  }, [unsettledExpenses, userGroups, user]);

  const formatCurrency = (value) => {
    return `₱${Number(value || 0).toFixed(2)}`;
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const recentActivities = useMemo(() => activities.slice(0, 4), [activities]);

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
            <h1>Welcome back, {user?.username || "User"}!</h1>
            <p>Track balances and recent group expenses in one place.</p>
            <p className="dashboard-hint">
              Your dashboard shows what you owe, what you're owed, and recent activity.
            </p>
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
          <div
            className="summary-card red clickable"
            onClick={() => navigate("/you-owe")}
            role="button"
            tabIndex={0}
          >
            <p>
              You Owe
              <span
                className="info-badge"
                title="This is the total amount you owe across all your groups."
              >
                i
              </span>
            </p>
            <h2>{formatCurrency(youOwe)}</h2>
            <span>Your pending balances</span>
          </div>

          <div
            className="summary-card green clickable"
            onClick={() => navigate("/you-are-owed")}
            role="button"
            tabIndex={0}
          >
            <p>
              You Are Owed
              <span
                className="info-badge"
                title="This is the total amount others owe you across all your groups."
              >
                i
              </span>
            </p>
            <h2>{formatCurrency(youAreOwed)}</h2>
            <span>Expected from members</span>
          </div>

          <div
            className="summary-card teal clickable"
            onClick={() => navigate("/balance")}
            role="button"
            tabIndex={0}
          >
            <p>
              Total Balance
              <span
                className="info-badge"
                title="Your net balance after subtracting what you owe from what you're owed."
              >
                i
              </span>
            </p>
            <h2>{formatCurrency(totalBalance)}</h2>
            <span>Your net standing</span>
          </div>
        </section>

        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            <button className="solid-btn" onClick={() => navigate("/expenses")}>Add Expense</button>
            <button className="ghost-btn" onClick={() => navigate("/groups")}>Create Group</button>
            <button className="ghost-btn" onClick={() => navigate("/activity")}>Settle Balance</button>
            <button className="ghost-btn" onClick={() => navigate("/profile")}>Profile</button>
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

            {unsettledExpenses.length === 0 ? (
              <div className="expense-row" style={{ opacity: 0.7 }}>
                <span style={{ gridColumn: "1 / -1" }}>
                  No expenses yet. Add one from the Expenses page.
                </span>
              </div>
            ) : (
              <>
                <div className="expense-header">
                  <span>Expense</span>
                  <span>Paid By</span>
                  <span>Amount</span>
                  <span>Date</span>
                  <span>Group</span>
                </div>
                {unsettledExpenses.slice(0, 4).map((exp) => (
                  <div className="expense-row" key={exp.id}>
                    <span>{exp.description}</span>
                    <span>{exp.paidBy}</span>
                    <span>{formatCurrency(exp.amount)}</span>
                    <span>{formatDate(exp.date)}</span>
                    <span className="tag">{groupMap[exp.groupId]?.name || "—"}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="panel">
            <div className="panel-top">
              <h3>My Groups</h3>
              <button className="mini-btn" onClick={() => navigate("/groups")}>Manage</button>
            </div>

            {userGroups.length === 0 ? (
              <p style={{ opacity: 0.7 }}>
                You&rsquo;re not in any groups yet. Create one or join one from the Groups page.
              </p>
            ) : (
              <div className="group-list">
                {userGroups.map((group) => {
                  const balance = groupBalances[group.id] || 0;
                  return (
                    <div key={group.id} className="group-item">
                      <div>
                        <strong>{group.name}</strong>
                        <p>{group.members.length} members</p>
                      </div>
                      <span className={balance >= 0 ? "positive" : "negative"}>
                        {balance === 0
                          ? "Settled"
                          : `${balance > 0 ? "+" : "-"}${formatCurrency(Math.abs(balance))}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-top">
              <h3>Quick Actions</h3>
              <button className="mini-btn" onClick={() => navigate("/activity")}>View Activity</button>
            </div>

            <div className="quick-grid">
              <button onClick={() => navigate("/groups")}>Create Group</button>
              <button onClick={() => navigate("/expenses")}>Add Expense</button>
              <button onClick={() => navigate("/activity")}>Settle Balance</button>
            </div>

            <div style={{ marginTop: 18 }}>
              <h4>Recent Activity</h4>
              {recentActivities.length === 0 ? (
                <p style={{ opacity: 0.7 }}>
                  No activity yet. Add an expense or settle a balance to begin.
                </p>
              ) : (
                <ul className="activity-list">
                  {recentActivities.map((activity) => (
                    <li key={activity.id}>
                      <span>{activity.message}</span>
                      <span className="muted">{formatDate(activity.date)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;