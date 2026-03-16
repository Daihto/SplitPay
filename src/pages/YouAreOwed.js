import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SplitPayContext } from "../context/SplitPayContext";
import "./Dashboard.css";

export default function YouAreOwed() {
  const navigate = useNavigate();
  const { user, groups, expenses, settleExpense } = useContext(SplitPayContext);

  const userGroups = useMemo(
    () => groups.filter((g) => g.members.includes(user?.username)),
    [groups, user]
  );

  const groupMap = useMemo(
    () => Object.fromEntries(groups.map((g) => [g.id, g])),
    [groups]
  );

  const unsettledExpenses = useMemo(
    () => expenses.filter((e) => !e.isSettled),
    [expenses]
  );

  const owedList = useMemo(
    () =>
      unsettledExpenses.filter(
        (exp) =>
          exp.paidBy === user?.username &&
          userGroups.some((g) => g.id === exp.groupId) &&
          exp.splitAmong.some((member) => member !== user?.username)
      ),
    [unsettledExpenses, user, userGroups]
  );

  const formatCurrency = (value) => `₱${Number(value || 0).toFixed(2)}`;

  const formatDate = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

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
            <h1>Expenses Others Owe You</h1>
            <p>These are the unsettled expenses you paid for that others still owe.</p>
          </div>
        </header>

        <div className="panel">
          {owedList.length === 0 ? (
            <p style={{ opacity: 0.7 }}>
              No outstanding balances owed to you at the moment.
            </p>
          ) : (
            <div>
              <div className="expense-header expense-header--actions">
                <span>Expense</span>
                <span>Group</span>
                <span>Amount</span>
                <span>Date</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {owedList.map((exp) => {
                const share = exp.amount / exp.splitAmong.length;
                return (
                  <div key={exp.id} className="expense-row expense-row--actions">
                    <span>{exp.description}</span>
                    <span className="tag">{groupMap[exp.groupId]?.name || "—"}</span>
                    <span>{formatCurrency(share)}</span>
                    <span>{formatDate(exp.date)}</span>
                    <span className="positive">Unsettled</span>
                    <button
                      className="mini-btn"
                      onClick={() => settleExpense(exp.id)}
                    >
                      Mark settled
                    </button>
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
