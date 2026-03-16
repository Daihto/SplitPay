import React, { useContext, useMemo, useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { SplitPayContext } from "../context/SplitPayContext";

function Activity() {
  const navigate = useNavigate();
  const { user, groups, activities, settleBalance } = useContext(SplitPayContext);

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [settleTo, setSettleTo] = useState("");
  const [settleAmount, setSettleAmount] = useState("");
  const [settleMessage, setSettleMessage] = useState("");

  const myGroups = useMemo(
    () => groups.filter((g) => g.members.includes(user?.username)),
    [groups, user]
  );

  const activeGroup = useMemo(
    () => myGroups.find((g) => g.id === selectedGroupId) || myGroups[0] || null,
    [myGroups, selectedGroupId]
  );

  const otherMembers = useMemo(
    () => (activeGroup ? activeGroup.members.filter((m) => m !== user) : []),
    [activeGroup, user]
  );

  const recentActivities = useMemo(() => activities.slice(0, 20), [activities]);

  const formatDate = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value) => `₱${Number(value || 0).toFixed(2)}`;

  const handleSettle = () => {
    if (!activeGroup) {
      setSettleMessage("Select a group before settling.");
      return;
    }
    if (!settleTo) {
      setSettleMessage("Choose someone to settle with.");
      return;
    }
    if (!settleAmount || Number(settleAmount) <= 0) {
      setSettleMessage("Enter a valid amount.");
      return;
    }

    settleBalance(activeGroup.id, settleTo, Number(settleAmount));
    setSettleMessage(`Settled ${formatCurrency(settleAmount)} with ${settleTo}`);
    setSettleAmount("");
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
            <BackButton />
            <h1>Activity</h1>
            <p>See your latest SplitPay activity here.</p>
          </div>
        </header>

        <div className="panel">
          {settleMessage && <div className="info-box">{settleMessage}</div>}

          {myGroups.length > 0 && (
            <div className="panel-section">
              <h3>Settle a Balance</h3>
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

              <select
                className="input-field"
                value={settleTo}
                onChange={(e) => setSettleTo(e.target.value)}
              >
                <option value="">Settle with...</option>
                {otherMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>

              <input
                className="input-field"
                placeholder="Amount"
                type="number"
                min="0"
                step="0.01"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
              />

              <button className="solid-btn" onClick={handleSettle}>
                Settle now
              </button>
            </div>
          )}

          {recentActivities.length === 0 ? (
            <p style={{ opacity: 0.75 }}>
              No activity yet. Add expenses or create a group to start tracking.
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
    </div>
  );
}

export default Activity;