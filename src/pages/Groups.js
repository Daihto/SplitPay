import React, { useContext, useMemo, useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { SplitPayContext } from "../context/SplitPayContext";

function Groups() {
  const navigate = useNavigate();
  const { user, groups, createGroup, joinGroup } = useContext(SplitPayContext);

  const [newGroupName, setNewGroupName] = useState("");
  const [joinId, setJoinId] = useState("");
  const [message, setMessage] = useState("");

  const myGroups = useMemo(
    () => groups.filter((g) => g.members.includes(user?.username)),
    [groups, user]
  );

  const otherGroups = useMemo(
    () => groups.filter((g) => !g.members.includes(user?.username)),
    [groups, user]
  );

  const handleCreate = () => {
    if (!newGroupName.trim()) {
      setMessage("Group name can't be empty.");
      return;
    }
    createGroup(newGroupName.trim());
    setMessage(`Created "${newGroupName.trim()}"`);
    setNewGroupName("");
  };

  const handleJoin = async () => {
    const cleaned = joinId.trim();
    if (!cleaned) {
      setMessage("Enter a group ID to join.");
      return;
    }

    const joined = await joinGroup(cleaned);
    if (!joined) {
      setMessage("No group found with that ID.");
      return;
    }

    setMessage(`Joined group!`);
    setJoinId("");
  };

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
            <BackButton />
            <h1>My Groups</h1>
            <p>View and manage your expense groups.</p>
          </div>
        </header>

        <div className="panel">
          {message && <div className="info-box">{message}</div>}

          <div className="panel-section">
            <h3>Your Groups</h3>
            {myGroups.length === 0 ? (
              <p style={{ opacity: 0.75 }}>
                You are not in any groups yet. Create one or join an existing group.
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
          </div>

          <div className="panel-section" style={{ marginTop: 24 }}>
            <h3>Create a Group</h3>
            <input
              className="input-field"
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button className="solid-btn" onClick={handleCreate}>
              Create
            </button>

            <h3 style={{ marginTop: 24 }}>Join a Group</h3>
            <input
              className="input-field"
              placeholder="Group ID"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
            />
            <button className="ghost-btn" onClick={handleJoin}>
              Join
            </button>

            {otherGroups.length > 0 && (
              <>
                <h4 style={{ marginTop: 24 }}>Available groups</h4>
                <p style={{ opacity: 0.7 }}>
                  Copy an ID to join one of these groups.
                </p>
                <div className="group-list">
                  {otherGroups.slice(0, 4).map((group) => (
                    <div key={group.id} className="group-item">
                      <div>
                        <strong>{group.name}</strong>
                        <p>{group.members.length} members</p>
                      </div>
                      <span className="tag">{group.id}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Groups;