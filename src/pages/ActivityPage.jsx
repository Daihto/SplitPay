import { useEffect, useState } from "react";
import { getApiErrorMessage, getGroupExpenses, getGroups } from "../api/apiService";
import { getActivityItems } from "../utils/activityUtils";

function ActivityPage() {
  const currentUser = JSON.parse(localStorage.getItem("splitpayUser"));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadActivity() {
      try {
        setLoading(true);
        setError("");
        const groups = await getGroups();
        const groupList = Array.isArray(groups) ? groups : [];

        const expenseResults = await Promise.allSettled(
          groupList.map(async (group) => {
            const expenses = await getGroupExpenses(group.id);
            return (Array.isArray(expenses) ? expenses : []).map((expense) => ({
              id: `expense-${expense.id}`,
              type: "EXPENSE",
              title: `Expense added: ${expense.description}`,
              subtitle: `${group.name} - $${Number(expense.amount || 0).toFixed(2)}`,
              createdAt: expense.createdAt || expense.date || new Date().toISOString()
            }));
          })
        );

        const successfulExpenses = expenseResults
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);

        const failedExpenseRequests = expenseResults.filter((result) => result.status === "rejected").length;

        const paymentEvents = getActivityItems(currentUser?.id).map((event) => ({
          id: `payment-${event.id}`,
          type: "PAYMENT",
          title: event.title,
          subtitle: event.subtitle,
          createdAt: event.createdAt
        }));

        const mergedItems = [...successfulExpenses.flat(), ...paymentEvents]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 25);

        setItems(mergedItems);

        if (failedExpenseRequests > 0) {
          setError("Some group activity is unavailable for this user right now.");
        }
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, "Could not load activity."));
      } finally {
        setLoading(false);
      }
    }

    loadActivity();
  }, [currentUser?.id]);

  if (loading) {
    return <p className="status-text">Loading activity...</p>;
  }

  return (
    <div className="page-content">
      <section className="hero-card hero-card--compact">
        <p className="hero-card__eyebrow">ACTIVITY</p>
        <h1>Recent Timeline</h1>
        <p className="hero-card__text">See latest expenses added and payments settled across your groups.</p>
      </section>
      {error ? <p className="feedback feedback--error">{error}</p> : null}

      <section className="card">
        <h2>Recent Activity</h2>
        {items.length === 0 ? <p>No recent activity yet.</p> : null}

        <ul className="list list--dense">
          {items.map((item) => (
            <li key={item.id} className="list__item">
              <div>
                <strong>{item.title}</strong>
                <p className="muted">{item.subtitle}</p>
                <p className="muted">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <span className={`activity-type ${item.type === "PAYMENT" ? "payment" : "expense"}`}>
                {item.type}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default ActivityPage;
