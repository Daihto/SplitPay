import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SplitPayContext } from "../context/SplitPayContext";
import "./Dashboard.css";

export default function BalanceOverview() {
  const navigate = useNavigate();
  const { user, groups, expenses } = useContext(SplitPayContext);

  const userGroups = useMemo(
    () => groups.filter((g) => g.members.includes(user?.username)),
    [groups, user]
  );

  const groupBalances = useMemo(() => {
    const balances = {};
    userGroups.forEach((group) => {
      balances[group.id] = 0;
    });

    const unsettled = expenses.filter((e) => !e.isSettled);

    unsettled.forEach((exp) => {
      if (!balances.hasOwnProperty(exp.groupId)) return;
      if (!Array.isArray(exp.splitAmong) || exp.splitAmong.length === 0) return;

      const share = exp.amount / exp.splitAmong.length;
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
  }, [expenses, userGroups, user]);

  const formatCurrency = (value) => `₱${Number(value || 0).toFixed(2)}`;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">SplitPay</div>

        <nav className="sidebar-menu">
          <button className="sidebar-item" onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button className="sidebar-item" onClick={() => navigate("/groups")}>My Groups</button>
          <button className="sidebar-item" onClick={() => navigate("/expenses")}>Expenses</button>
          <button className="sidebar-item" onClick={() => navigate("/activity")}>Activity</button>
          <button className="sidebar-item" onClick={() => navigate("/profile")}>Profile</button>
        </nav>
      </aside>

      <div className="dashboard-content">
        <header className="topbar">
          <div>
            <h1>Full Balance Overview</h1>
            <p>See how you are positioned in each group and review outstanding balances.</p>
          </div>
        </header>

        <div className="panel">
          {userGroups.length === 0 ? (
            <p style={{ opacity: 0.7 }}>
              You are not currently in any groups. Create or join a group to start tracking balances.
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
      </div>
    </div>
  );
}
