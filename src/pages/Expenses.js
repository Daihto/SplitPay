import React, { useContext, useMemo, useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { SplitPayContext } from "../context/SplitPayContext";

function Expenses() {
  const navigate = useNavigate();
  const { user, groups, expenses, addExpense, settleExpense } = useContext(SplitPayContext);

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("");
  const [message, setMessage] = useState("");

  const myGroups = useMemo(
    () => groups.filter((g) => g.members.includes(user?.username)),
    [groups, user]
  );

  const activeGroup = useMemo(
    () => myGroups.find((g) => g.id === selectedGroupId) || myGroups[0] || null,
    [myGroups, selectedGroupId]
  );

  const groupExpenses = useMemo(
    () =>
      expenses
        .filter((exp) => activeGroup && exp.groupId === activeGroup.id)
        .slice(0, 10),
    [expenses, activeGroup]
  );

  const formatCurrency = (value) => `₱${Number(value || 0).toFixed(2)}`;

  const formatDate = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setPayer("");
  };

  const handleAddExpense = () => {
    if (!activeGroup) {
      setMessage("Please create or join a group first.");
      return;
    }
    if (!description.trim() || !amount || Number(amount) <= 0) {
      setMessage("Please enter a valid description and amount.");
      return;
    }

    const payerName = payer || user;
    addExpense({
      groupId: activeGroup.id,
      description: description.trim(),
      amount: Number(amount),
      paidBy: payerName,
      splitAmong: activeGroup.members,
    });

    setMessage(`Added expense “${description.trim()}”`);
    resetForm();
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
            <BackButton />
            <h1>Expenses</h1>
            <p>Track and manage all expenses here.</p>
          </div>
        </header>

        <div className="panel">
          {message && <div className="info-box">{message}</div>}

          <div className="panel-section">
            <h3>Select Group</h3>
            {myGroups.length === 0 ? (
              <p style={{ opacity: 0.75 }}>
                You are not a member of any group yet. Create or join one on the
                Groups page.
              </p>
            ) : (
              <select
                className="input-field"
                value={activeGroup?.id || ""}
                onChange={(e) => setSelectedGroupId(e.target.value)}
              >
                {myGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {activeGroup && (
            <>
              <div className="panel-section" style={{ marginTop: 20 }}>
                <h3>Add Expense</h3>
                <input
                  className="input-field"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <input
                  className="input-field"
                  placeholder="Amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <select
                  className="input-field"
                  value={payer || user}
                  onChange={(e) => setPayer(e.target.value)}
                >
                  {activeGroup.members.map((member) => (
                    <option key={member} value={member}>
                      Paid by {member}
                    </option>
                  ))}
                </select>
                <button className="solid-btn" onClick={handleAddExpense}>
                  Add expense
                </button>
              </div>

              <div className="panel-section" style={{ marginTop: 24 }}>
                <h3>Recent Expenses</h3>
                {groupExpenses.length === 0 ? (
                  <p style={{ opacity: 0.75 }}>
                    No expenses recorded for this group yet.
                  </p>
                ) : (
                  <>
                    <div className="expense-header expense-header--actions">
                      <span>Expense</span>
                      <span>Paid By</span>
                      <span>Amount</span>
                      <span>Date</span>
                      <span>Status</span>
                      <span>Action</span>
                    </div>
                    {groupExpenses.map((exp) => (
                      <div key={exp.id} className="expense-row expense-row--actions">
                        <span>{exp.description}</span>
                        <span>{exp.paidBy}</span>
                        <span>{formatCurrency(exp.amount)}</span>
                        <span>{formatDate(exp.date)}</span>
                        <span className={exp.isSettled ? "positive" : "negative"}>
                          {exp.isSettled ? "Settled" : "Unsettled"}
                        </span>
                        <button
                          className="mini-btn"
                          disabled={exp.isSettled}
                          onClick={() => settleExpense(exp.id)}
                        >
                          Mark settled
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Expenses;