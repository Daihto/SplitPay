import { useEffect, useMemo, useState } from "react";
import { getUserBalances } from "../api/apiService";
import { addActivityItem } from "../utils/activityUtils";
import { applySettledStatus, markBalanceSettled } from "../utils/settlementUtils";

function BalancesPage() {
  const currentUser = JSON.parse(localStorage.getItem("splitpayUser"));
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBalances() {
      if (!currentUser?.id) {
        setError("Please login again.");
        setLoading(false);
        return;
      }

      try {
        const data = await getUserBalances(currentUser.id);
        const normalizedBalances = applySettledStatus(data, currentUser.id);
        setBalances(normalizedBalances);
      } catch (apiError) {
        setError(apiError.response?.data?.message ?? "Could not load balances.");
      } finally {
        setLoading(false);
      }
    }

    loadBalances();
  }, [currentUser?.id]);

  const totals = useMemo(() => {
    return balances.reduce(
      (acc, row) => {
        if (row.settled) {
          return acc;
        }

        const amount = Number(row.amount || 0);
        if (amount > 0) {
          acc.receive += amount;
        } else {
          acc.pay += Math.abs(amount);
        }
        return acc;
      },
      { pay: 0, receive: 0 }
    );
  }, [balances]);

  function handleMarkSettled(item) {
    if (!currentUser?.id) {
      return;
    }

    markBalanceSettled(currentUser.id, item);

    addActivityItem(currentUser.id, {
      title: "Payment settled",
      subtitle: `${item.fromUserName || item.fromName || "User"} paid ${item.toUserName || item.toName || "User"}`,
      createdAt: new Date().toISOString()
    });

    setBalances((prev) =>
      prev.map((balance) => {
        if (balance._balanceKey === item._balanceKey) {
          return { ...balance, settled: true, status: "SETTLED" };
        }

        return balance;
      })
    );
  }

  if (loading) {
    return <p className="status-text">Loading balances...</p>;
  }

  return (
    <div className="page-content">
      <section className="hero-card hero-card--compact">
        <p className="hero-card__eyebrow">BALANCES</p>
        <h1>Who Owes Whom</h1>
        <p className="hero-card__text">Track pending payments and settle debts as soon as they are completed.</p>
      </section>
      {error ? <p className="feedback feedback--error">{error}</p> : null}

      <div className="card-grid">
        <section className="card summary-card">
          <p className="summary-card__title">You Owe</p>
          <p className="summary-card__value">${totals.pay.toFixed(2)}</p>
        </section>
        <section className="card summary-card">
          <p className="summary-card__title">You Should Receive</p>
          <p className="summary-card__value">${totals.receive.toFixed(2)}</p>
        </section>
      </div>

      <section className="card">
        <h2>Who Owes Whom</h2>
        {balances.length === 0 ? <p>No pending balances.</p> : null}
        <ul className="list list--dense">
          {balances.map((item, index) => {
            const amount = Math.abs(Number(item.amount || 0));
            const isSettled = item.settled === true || item.status === "SETTLED";

            return (
              <li key={`${item.id || index}-${amount}`} className="list__item">
                <div>
                  <strong>
                    {item.fromUserName || item.fromName || "User"} owes {item.toUserName || item.toName || "User"}
                  </strong>
                  <p className={`balance-status ${isSettled ? "settled" : "unpaid"}`}>
                    {isSettled ? "Settled" : "Unpaid"}
                  </p>
                </div>
                <div className="list__item-actions">
                  <span>${amount.toFixed(2)}</span>
                  {!isSettled ? (
                    <button className="button button--small" type="button" onClick={() => handleMarkSettled(item)}>
                      Mark Settled
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export default BalancesPage;
