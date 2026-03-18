import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addMemberToGroup,
  getGroupBalances,
  getGroupById,
  getGroupExpenses
} from "../api/apiService";

function GroupDetailsPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      const [groupData, expensesData, balancesData] = await Promise.all([
        getGroupById(groupId),
        getGroupExpenses(groupId),
        getGroupBalances(groupId)
      ]);

      setGroup(groupData);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setBalances(Array.isArray(balancesData) ? balancesData : []);
    } catch (apiError) {
      setError(apiError.response?.data?.message ?? "Could not load group details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [groupId]);

  async function handleAddMember(event) {
    event.preventDefault();

    try {
      await addMemberToGroup(groupId, { email: memberEmail.trim() });
      setMemberEmail("");
      await loadData();
    } catch (apiError) {
      setError(apiError.response?.data?.message ?? "Could not add member.");
    }
  }

  if (loading) {
    return <p className="status-text">Loading group details...</p>;
  }

  return (
    <div className="page-content">
      {error ? <p className="feedback feedback--error">{error}</p> : null}

      <section className="hero-card hero-card--compact">
        <p className="hero-card__eyebrow">GROUP DETAILS</p>
        <h1>{group?.name || "Group Details"}</h1>
        <p className="hero-card__text">Manage members, expenses, and balances for this shared wallet.</p>
      </section>

      <section className="card card--form">
        <h2>Members</h2>
        <ul className="list list--dense">
          {(group?.members || []).map((member) => (
            <li key={member.id || member.email} className="list__item">
              <span>{member.name || member.email}</span>
              <span className="muted">{member.email}</span>
            </li>
          ))}
        </ul>

        <form className="inline-form" onSubmit={handleAddMember}>
          <input
            type="email"
            placeholder="Add member by email"
            value={memberEmail}
            onChange={(event) => setMemberEmail(event.target.value)}
            required
          />
          <button type="submit" className="button">
            Add Member
          </button>
        </form>
      </section>

      <section className="card">
        <div className="section-title-with-action">
          <h2>Expenses</h2>
          <Link className="button" to={`/expenses/add?groupId=${groupId}`}>
            Add Expense
          </Link>
        </div>
        {expenses.length === 0 ? <p>No expenses in this group yet.</p> : null}
        <ul className="list list--dense">
          {expenses.map((expense) => (
            <li key={expense.id} className="list__item">
              <div>
                <strong>{expense.description}</strong>
                <p className="muted">Paid by {expense.paidByName || expense.paidBy?.name || "Unknown"}</p>
              </div>
              <span>${Number(expense.amount || 0).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Balances Inside Group</h2>
        {balances.length === 0 ? <p>No balances yet.</p> : null}
        <ul className="list list--dense">
          {balances.map((item, index) => (
            <li key={`${item.fromUserId || index}-${item.toUserId || index}`} className="list__item">
              <span>
                {item.fromUserName || item.fromName || "Member"} owes {item.toUserName || item.toName || "Member"}
              </span>
              <span>${Number(item.amount || 0).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default GroupDetailsPage;
