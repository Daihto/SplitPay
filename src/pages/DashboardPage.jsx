import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage, getGroupExpenses, getGroups, getUserBalances } from "../api/apiService";
import { applySettledStatus, getBalancePerspective } from "../utils/settlementUtils";

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

function CountUpValue({ value, prefix = "", decimals = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(value || 0);
    const duration = 650;
    const start = performance.now();

    function animate(time) {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplayValue(target * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [value]);

  return `${prefix}${displayValue.toFixed(decimals)}`;
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
        setError("");
        const groupsData = await getGroups();
        const groupsList = Array.isArray(groupsData) ? groupsData : [];
        setGroups(groupsList);

        if (currentUser?.id) {
          const userBalances = await getUserBalances(currentUser.id);
          const normalizedBalances = applySettledStatus(userBalances, currentUser.id);
          setBalances(normalizedBalances);
        }

        const expensesByGroup = await Promise.allSettled(
          groupsList.map(async (group) => {
            const groupExpenses = await getGroupExpenses(group.id);
            return (Array.isArray(groupExpenses) ? groupExpenses : []).map((item) => ({
              ...item,
              groupName: group.name
            }));
          })
        );

        const successfulExpenses = expensesByGroup
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);

        const failedExpenseRequests = expensesByGroup.filter((result) => result.status === "rejected").length;

        setRecentExpenses(
          successfulExpenses
            .flat()
            .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
            .slice(0, 5)
        );

        if (failedExpenseRequests > 0) {
          setError("Some group expenses could not be loaded for your account yet. You can still use available groups.");
        }
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, "Could not load dashboard."));
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

        const balance = getBalancePerspective(row, currentUser?.id);
        if (balance.type === "owed") {
          acc.owedToYou += balance.amount;
        } else if (balance.type === "owe") {
          acc.youOwe += balance.amount;
        }

        return acc;
      },
      { youOwe: 0, owedToYou: 0 }
    );
  }, [balances, currentUser?.id]);

  const totalBalance = totals.owedToYou - totals.youOwe;
  const outstandingBalances = balances.filter((row) => !row.settled).length;
  const settledBalances = balances.filter((row) => row.settled).length;
  const settlementRatio = balances.length > 0 ? (settledBalances / balances.length) * 100 : 0;
  const netTone = totalBalance >= 0 ? "positive" : "negative";
  const topGroup = useMemo(() => {
    if (groups.length === 0) {
      return null;
    }

    return [...groups].sort((a, b) => (b.members?.length ?? 0) - (a.members?.length ?? 0))[0];
  }, [groups]);

  const unsettledBalanceRows = useMemo(() => {
    return balances
      .filter((item) => !item.settled)
      .map((item) => ({
        ...item,
        perspective: getBalancePerspective(item, currentUser?.id)
      }))
      .sort((a, b) => b.perspective.amount - a.perspective.amount)
      .slice(0, 5);
  }, [balances, currentUser?.id]);

  const spendingChartData = useMemo(() => {
    const now = new Date();
    const dayBuckets = new Map();

    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const key = day.toISOString().slice(0, 10);
      dayBuckets.set(key, {
        key,
        label: day.toLocaleDateString("en-US", { weekday: "short" }),
        total: 0
      });
    }

    recentExpenses.forEach((expense) => {
      const key = new Date(expense.createdAt || expense.date || now).toISOString().slice(0, 10);
      if (dayBuckets.has(key)) {
        dayBuckets.get(key).total += Number(expense.amount || 0);
      }
    });

    const data = Array.from(dayBuckets.values());
    const max = Math.max(...data.map((item) => item.total), 1);

    return data.map((item) => ({
      ...item,
      fill: Math.max((item.total / max) * 100, 6)
    }));
  }, [recentExpenses]);

  if (loading) {
    return <p className="status-text">Loading dashboard...</p>;
  }

  return (
    <div className="page-content dashboard-page dashboard-page--premium dashboard-page--concept">
      <section className="dashboard-concept__header">
        <div>
          <p className="dashboard-concept__eyebrow">Statistics</p>
          <h1>Welcome back{currentUser?.name ? `, ${currentUser.name}` : ""}</h1>
          <p>Simple view of balances, spending trend, and the people you need to settle with.</p>
        </div>
        <div className="dashboard-concept__header-actions">
          <Link className="button" to="/expenses/add">Add Expense</Link>
          <Link className="button button--secondary" to="/balances">Review Balances</Link>
        </div>
      </section>

      <section className="dashboard-concept__kpis">
        <article className={`dashboard-concept__kpi dashboard-concept__kpi--${netTone}`}>
          <p>Net Position</p>
          <strong><CountUpValue value={totalBalance} prefix="$" decimals={2} /></strong>
        </article>
        <article className="dashboard-concept__kpi dashboard-concept__kpi--positive">
          <p>You Are Owed</p>
          <strong><CountUpValue value={totals.owedToYou} prefix="$" decimals={2} /></strong>
        </article>
        <article className="dashboard-concept__kpi dashboard-concept__kpi--negative">
          <p>You Owe</p>
          <strong><CountUpValue value={totals.youOwe} prefix="$" decimals={2} /></strong>
        </article>
        <article className="dashboard-concept__kpi">
          <p>Open Balances</p>
          <strong>{outstandingBalances}</strong>
          <span>{settlementRatio.toFixed(0)}% settled</span>
        </article>
      </section>

      {error ? <p className="feedback feedback--error">{error}</p> : null}

      <section className="dashboard-concept__layout">
        <article className="dashboard-concept__panel dashboard-concept__panel--wide">
          <div className="dashboard-card__head">
            <h2>Spending Trend</h2>
            <span className="dashboard-card__sub">Last 7 days</span>
          </div>
          <div className="dashboard-chart dashboard-chart--concept">
            {spendingChartData.map((point) => (
              <div key={point.key} className="dashboard-chart__bar-wrap">
                <div className="dashboard-chart__bar" style={{ height: `${Math.max(point.fill, 8)}%` }} />
                <span>{point.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-concept__panel">
          <div className="dashboard-card__head">
            <h2>Who Owes Whom</h2>
            <Link to="/balances">See all</Link>
          </div>
          {unsettledBalanceRows.length === 0 ? <p>No unsettled balances.</p> : null}
          <ul className="dashboard-owe-list dashboard-owe-list--concept">
            {unsettledBalanceRows.map((item, index) => (
              <li key={`${item._balanceKey || item.id || index}-owe`}>
                <span>
                  {item.perspective.type === "owe"
                    ? `You owe ${item.perspective.counterpartName}`
                    : `${item.perspective.counterpartName} owes you`}
                </span>
                <strong>{formatCurrency(item.perspective.amount)}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="dashboard-concept__panel dashboard-concept__panel--wide">
          <div className="dashboard-card__head">
            <h2>Recent Expenses</h2>
            <Link to="/activity">View all</Link>
          </div>
          {recentExpenses.length === 0 ? <p>No recent expenses.</p> : null}
          <ul className="list list--dense expense-feed expense-feed--concept">
            {recentExpenses.map((expense) => (
              <li key={expense.id} className="list__item expense-feed__item">
                <div>
                  <strong>{expense.description}</strong>
                  <p className="muted">{expense.groupName} • {formatShortDate(expense.createdAt || expense.date)}</p>
                </div>
                <span>{formatCurrency(expense.amount)}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="dashboard-concept__panel">
          <div className="dashboard-card__head">
            <h2>Groups</h2>
            <Link to="/groups">Manage</Link>
          </div>
          <p className="dashboard-concept__panel-note">
            {topGroup ? `Largest group: ${topGroup.name}` : "No groups yet."}
          </p>
          <ul className="dashboard-groups dashboard-groups--concept">
            {groups.slice(0, 4).map((group) => (
              <li key={group.id} className="dashboard-groups__item">
                <div>
                  <strong>{group.name}</strong>
                  <p className="muted">{group.members?.length ?? 0} members</p>
                </div>
                <div className="dashboard-groups__meta">
                  <Link to={`/groups/${group.id}`}>Open</Link>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;
