import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import splitpayAtmosphere from "../assets/splitpay-atmosphere.svg";
import { getGroupExpenses, getGroups, getUserBalances } from "../api/apiService";
import SummaryCard from "../components/SummaryCard";
import { applySettledStatus } from "../utils/settlementUtils";

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatShortDate(value) {
  if (!value) {
    return "No date";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(parsedDate);
}

function DashboardPage() {
  const currentUser = JSON.parse(localStorage.getItem("splitpayUser"));
  const [groups, setGroups] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const groupsData = await getGroups();
        const groupsList = Array.isArray(groupsData) ? groupsData : [];
        setGroups(groupsList);

        if (currentUser?.id) {
          const userBalances = await getUserBalances(currentUser.id);
          const normalizedBalances = applySettledStatus(userBalances, currentUser.id);
          setBalances(normalizedBalances);
        }

        const expensesByGroup = await Promise.all(
          groupsList.map(async (group) => {
            const groupExpenses = await getGroupExpenses(group.id);
            return (Array.isArray(groupExpenses) ? groupExpenses : []).map((item) => ({
              ...item,
              groupName: group.name
            }));
          })
        );

        setRecentExpenses(
          expensesByGroup
            .flat()
            .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
            .slice(0, 5)
        );
      } catch (apiError) {
        setError(apiError.response?.data?.message ?? "Could not load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentUser?.id]);

  const totals = useMemo(() => {
    return balances.reduce(
      (acc, row) => {
        if (row.settled) {
          return acc;
        }

        const amount = Number(row.amount || 0);
        if (amount > 0) {
          acc.owedToYou += amount;
        } else {
          acc.youOwe += Math.abs(amount);
        }
        return acc;
      },
      { youOwe: 0, owedToYou: 0 }
    );
  }, [balances]);

  const totalBalance = totals.owedToYou - totals.youOwe;
  const outstandingBalances = balances.filter((row) => !row.settled).length;
  const netTone = totalBalance >= 0 ? "positive" : "negative";
  const topGroup = useMemo(() => {
    if (groups.length === 0) {
      return null;
    }

    return [...groups].sort((a, b) => (b.members?.length ?? 0) - (a.members?.length ?? 0))[0];
  }, [groups]);

  if (loading) {
    return <p className="status-text">Loading dashboard...</p>;
  }

  return (
    <div className="page-content dashboard-page">
      <img
        className="dashboard-bg-art"
        src={splitpayAtmosphere}
        alt=""
        aria-hidden="true"
      />
      <div className="dashboard-bg-haze" />

      <section className="hero-card dashboard-hero">
        <div className="dashboard-hero__content">
          <p className="hero-card__eyebrow">CONTROL CENTER</p>
          <h1>Welcome back{currentUser?.name ? `, ${currentUser.name}` : ""}</h1>
          <p className="hero-card__text">Keep your shared expenses clean with live balances, recent activity, and actions that help you settle faster.</p>
          <div className="dashboard-hero__tags">
            <span>Synced view</span>
            <span>{outstandingBalances} open balances</span>
            <span>{groups.length} active groups</span>
          </div>
        </div>

        <div className="dashboard-hero__stats">
          <article className="dashboard-pill">
            <p>Open balances</p>
            <strong>{outstandingBalances}</strong>
          </article>
          <article className="dashboard-pill">
            <p>Recent expenses</p>
            <strong>{recentExpenses.length}</strong>
          </article>
          <article className="dashboard-pill">
            <p>Active groups</p>
            <strong>{groups.length}</strong>
          </article>
        </div>
      </section>

      {error ? <p className="feedback feedback--error">{error}</p> : null}

      <div className="card-grid card-grid--metrics dashboard-metrics">
        <SummaryCard
          title="Total You Owe"
          value={formatCurrency(totals.youOwe)}
          subtitle="Outstanding payments"
          tone="negative"
        />
        <SummaryCard
          title="You Are Owed"
          value={formatCurrency(totals.owedToYou)}
          subtitle="Incoming reimbursements"
          tone="positive"
        />
        <SummaryCard
          title="Net Balance"
          value={formatCurrency(totalBalance)}
          subtitle={totalBalance >= 0 ? "Healthy position" : "Needs attention"}
          tone={netTone}
        />
        <SummaryCard
          title="Total Groups"
          value={groups.length}
          subtitle={topGroup ? `Largest: ${topGroup.name}` : "No groups yet"}
          tone="neutral"
        />
      </div>

      <section className="card dashboard-spotlight">
        <div>
          <p className="dashboard-spotlight__label">Current Position</p>
          <h2 className={`dashboard-spotlight__value dashboard-spotlight__value--${netTone}`}>{formatCurrency(totalBalance)}</h2>
          <p className="muted">{totalBalance >= 0 ? "You are net positive across all groups." : "You currently owe more than you are owed."}</p>

          <div className="dashboard-spotlight__bars">
            <div>
              <span>Incoming</span>
              <strong>{formatCurrency(totals.owedToYou)}</strong>
            </div>
            <div>
              <span>Outgoing</span>
              <strong>{formatCurrency(totals.youOwe)}</strong>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="quick-actions__buttons">
            <Link className="button" to="/expenses/add">
              Add Expense
            </Link>
            <Link className="button button--secondary" to="/groups">
              Create Group
            </Link>
            <Link className="button button--secondary" to="/balances">
              Review Balances
            </Link>
          </div>
        </div>
      </section>

      <div className="dashboard-columns">
        <section className="card dashboard-card">
          <div className="dashboard-card__head">
            <h2>Recent Expenses</h2>
            <Link to="/activity">View all</Link>
          </div>
          {recentExpenses.length === 0 ? <p>No recent expenses.</p> : null}
          <ul className="list list--dense expense-feed">
            {recentExpenses.map((expense) => (
              <li key={expense.id} className="list__item expense-feed__item">
                <div>
                  <strong>{expense.description}</strong>
                  <p className="muted">
                    {expense.groupName} • {formatShortDate(expense.createdAt || expense.date)}
                  </p>
                </div>
                <span>{formatCurrency(expense.amount)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card dashboard-card">
          <div className="dashboard-card__head">
            <h2>Group Summary</h2>
            <Link to="/groups">Manage groups</Link>
          </div>
          {groups.length === 0 ? <p>No groups yet.</p> : null}
          <ul className="dashboard-groups">
            {groups.map((group) => (
              <li key={group.id} className="dashboard-groups__item">
                <div>
                  <strong>{group.name}</strong>
                  <p className="muted">{group.id === topGroup?.id ? "Largest group" : "Group overview"}</p>
                </div>
                <div className="dashboard-groups__meta">
                  <span>{group.members?.length ?? 0} members</span>
                  <Link to={`/groups/${group.id}`}>Open</Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
