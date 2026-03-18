function buildBalanceKey(item) {
  const fromId = String(item.fromUserId ?? item.fromName ?? "from");
  const toId = String(item.toUserId ?? item.toName ?? "to");
  const amount = Number(item.amount || 0).toFixed(2);
  return `${fromId}->${toId}:${amount}`;
}

function normalizeUserId(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function getStorageKey(userId) {
  return `splitpaySettledBalances:${userId}`;
}

function getSettledMap(userId) {
  if (!userId) {
    return {};
  }

  const raw = localStorage.getItem(getStorageKey(userId));
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveSettledMap(userId, settledMap) {
  if (!userId) {
    return;
  }

  localStorage.setItem(getStorageKey(userId), JSON.stringify(settledMap));
}

function applySettledStatus(balances, userId) {
  const settledMap = getSettledMap(userId);
  return (Array.isArray(balances) ? balances : []).map((item) => {
    const key = buildBalanceKey(item);
    const isSettledByBackend = item.settled === true || item.status === "SETTLED";
    const isSettledLocally = settledMap[key] === true;

    return {
      ...item,
      _balanceKey: key,
      settled: isSettledByBackend || isSettledLocally,
      status: isSettledByBackend || isSettledLocally ? "SETTLED" : "UNPAID"
    };
  });
}

function getBalancePerspective(item, currentUserId) {
  const currentId = normalizeUserId(currentUserId);
  const fromId = normalizeUserId(item?.fromUserId ?? item?.fromUser?.id);
  const toId = normalizeUserId(item?.toUserId ?? item?.toUser?.id);
  const amount = Math.abs(Number(item?.amount || 0));

  if (fromId && currentId && fromId === currentId) {
    return {
      type: "owe",
      amount,
      counterpartName: item?.toUserName || item?.toName || "User"
    };
  }

  if (toId && currentId && toId === currentId) {
    return {
      type: "owed",
      amount,
      counterpartName: item?.fromUserName || item?.fromName || "User"
    };
  }

  // Fallback for payloads that omit from/to ids and encode direction in amount sign.
  if (Number(item?.amount || 0) < 0) {
    return {
      type: "owe",
      amount,
      counterpartName: item?.toUserName || item?.toName || "User"
    };
  }

  return {
    type: "owed",
    amount,
    counterpartName: item?.fromUserName || item?.fromName || "User"
  };
}

function markBalanceSettled(userId, balanceItem) {
  const key = buildBalanceKey(balanceItem);
  const settledMap = getSettledMap(userId);
  settledMap[key] = true;
  saveSettledMap(userId, settledMap);
}

export { applySettledStatus, buildBalanceKey, getBalancePerspective, getSettledMap, markBalanceSettled };
