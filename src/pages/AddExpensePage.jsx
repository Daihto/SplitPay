import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addExpense, getGroupById, getGroups } from "../api/apiService";

function AddExpensePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedGroupId = new URLSearchParams(location.search).get("groupId") || "";

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    paidByUserId: "",
    groupId: preselectedGroupId,
    participantIds: []
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadGroups() {
      try {
        const data = await getGroups();
        setGroups(Array.isArray(data) ? data : []);
      } catch (apiError) {
        setError(apiError.response?.data?.message ?? "Could not load groups.");
      }
    }

    loadGroups();
  }, []);

  useEffect(() => {
    async function loadGroup(groupId) {
      if (!groupId) {
        setSelectedGroup(null);
        return;
      }

      try {
        const groupData = await getGroupById(groupId);
        setSelectedGroup(groupData);

        if (!formData.paidByUserId && groupData.members?.length) {
          setFormData((prev) => ({
            ...prev,
            paidByUserId: String(groupData.members[0].id)
          }));
        }
      } catch (apiError) {
        setError(apiError.response?.data?.message ?? "Could not load selected group.");
      }
    }

    loadGroup(formData.groupId);
  }, [formData.groupId]);

  const members = useMemo(() => selectedGroup?.members || [], [selectedGroup]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleParticipantToggle(memberId) {
    setFormData((prev) => {
      const included = prev.participantIds.includes(memberId);
      return {
        ...prev,
        participantIds: included
          ? prev.participantIds.filter((id) => id !== memberId)
          : [...prev.participantIds, memberId]
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (formData.participantIds.length === 0) {
      setError("Select at least one participant.");
      return;
    }

    try {
      setLoading(true);
      await addExpense({
        description: formData.description,
        amount: Number(formData.amount),
        paidByUserId: Number(formData.paidByUserId),
        groupId: Number(formData.groupId),
        participantIds: formData.participantIds.map(Number)
      });

      navigate(`/groups/${formData.groupId}`);
    } catch (apiError) {
      setError(apiError.response?.data?.message ?? "Could not save expense.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-content">
      <section className="hero-card hero-card--compact">
        <p className="hero-card__eyebrow">EXPENSE ENTRY</p>
        <h1>Add New Expense</h1>
        <p className="hero-card__text">Record who paid and who shared the cost. SplitPay will handle the math.</p>
      </section>

      <section className="card card--form">
        <h2>Expense Details</h2>
        <form className="stack-form" onSubmit={handleSubmit}>
          <label htmlFor="description">Expense Description</label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="Dinner"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
          />

          <label htmlFor="groupId">Group</label>
          <select id="groupId" name="groupId" value={formData.groupId} onChange={handleChange} required>
            <option value="">Select group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          <label htmlFor="paidByUserId">Paid By</label>
          <select id="paidByUserId" name="paidByUserId" value={formData.paidByUserId} onChange={handleChange} required>
            <option value="">Select member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name || member.email}
              </option>
            ))}
          </select>

          <fieldset className="checkbox-group">
            <legend>Participants sharing the expense</legend>
            {members.map((member) => (
              <label key={member.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.participantIds.includes(member.id)}
                  onChange={() => handleParticipantToggle(member.id)}
                />
                {member.name || member.email}
              </label>
            ))}
          </fieldset>

          {error ? <p className="feedback feedback--error">{error}</p> : null}

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Expense"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default AddExpensePage;
