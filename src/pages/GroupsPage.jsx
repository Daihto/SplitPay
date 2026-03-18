import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createGroup, getGroups } from "../api/apiService";

function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadGroups() {
    try {
      setLoading(true);
      const data = await getGroups();
      setGroups(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setError(apiError.response?.data?.message ?? "Could not load groups.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  async function handleCreateGroup(event) {
    event.preventDefault();
    if (!newGroupName.trim()) {
      return;
    }

    try {
      await createGroup({ name: newGroupName.trim() });
      setNewGroupName("");
      await loadGroups();
    } catch (apiError) {
      setError(apiError.response?.data?.message ?? "Could not create group.");
    }
  }

  return (
    <div className="page-content">
      <section className="hero-card hero-card--compact">
        <p className="hero-card__eyebrow">GROUPS</p>
        <h1>Your Expense Groups</h1>
        <p className="hero-card__text">Create groups for trips, homes, teams, or any shared spending setup.</p>
      </section>

      <section className="card card--form">
        <h2>Create New Group</h2>
        <form className="inline-form" onSubmit={handleCreateGroup}>
          <input
            type="text"
            placeholder="Enter group name"
            value={newGroupName}
            onChange={(event) => setNewGroupName(event.target.value)}
            required
          />
          <button type="submit" className="button">
            Create Group
          </button>
        </form>
      </section>

      <section className="card">
        <h2>All Groups</h2>
        {error ? <p className="feedback feedback--error">{error}</p> : null}
        {loading ? <p>Loading groups...</p> : null}
        {!loading && groups.length === 0 ? <p>No groups available.</p> : null}

        <ul className="list list--dense">
          {groups.map((group) => (
            <li key={group.id} className="list__item">
              <div>
                <strong>{group.name}</strong>
                <p className="muted">{group.members?.length ?? 0} members in this group</p>
              </div>
              <Link className="button button--secondary" to={`/groups/${group.id}`}>
                View Details
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default GroupsPage;
