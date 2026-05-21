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

function normalizeId(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function buildMemberLookup(members = []) {
  return (Array.isArray(members) ? members : []).reduce((lookup, member) => {
    const id = normalizeId(member?.id ?? member);
    if (!id) {
      return lookup;
    }

    lookup[id] = normalizeText(member?.name ?? member?.username ?? member?.email ?? member);
    return lookup;
  }, {});
}

function extractExpensePaymentInfo(expense) {
  const paidByUserId = normalizeId(
    expense?.paidByUserId ?? expense?.paidBy ?? expense?.paid_by ?? expense?.payerId ?? expense?.payer_id
  );

  const splitAmong = Array.isArray(expense?.splitAmong)
    ? expense.splitAmong
    : Array.isArray(expense?.participantIds)
    ? expense.participantIds
    : Array.isArray(expense?.split_among)
    ? expense.split_among
    : [];

  const participantIds = splitAmong
    .map(normalizeId)
    .filter((id) => id && id !== "null" && id !== "undefined");

  const amount = Number(expense?.amount ?? 0);
  const settled = Boolean(
    expense?.settled === true ||
      expense?.status === "SETTLED" ||
      expense?.isSettled === true ||
      expense?.is_settled === true
  );

  return {
    paidByUserId,
    participantIds,
    amount,
    settled
  };
}

function buildBalanceItemsFromExpense(expense, memberLookup = {}, groupName = "") {
  const { paidByUserId, participantIds, amount, settled } = extractExpensePaymentInfo(expense);
  if (!paidByUserId || participantIds.length === 0 || amount <= 0) {
    return [];
  }

  const share = amount / participantIds.length;
  return participantIds
    .filter((participantId) => participantId !== paidByUserId)
    .map((participantId) => ({
      id: `${normalizeId(expense?.id) || Math.random().toString(36).slice(2, 10)}-${participantId}-${paidByUserId}`,
      fromUserId: participantId,
      toUserId: paidByUserId,
      fromUserName: memberLookup[participantId] || normalizeText(expense?.participantNames?.[participantId]) || participantId,
      toUserName: memberLookup[paidByUserId] || normalizeText(expense?.paidByName ?? expense?.paidBy ?? expense?.paid_by ?? expense?.payerName) || paidByUserId,
      amount: Number(share.toFixed(2)),
      settled,
      groupId: normalizeId(expense?.groupId ?? expense?.group_id),
      groupName: groupName || normalizeText(expense?.groupName ?? expense?.group?.name)
    }));
}

function calculateGroupBalancesFromExpenses(expenses = [], group = {}) {
  const memberLookup = buildMemberLookup(group.members);
  return (Array.isArray(expenses) ? expenses : []).flatMap((expense) =>
    buildBalanceItemsFromExpense(expense, memberLookup, group.name)
  );
}

function calculateUserBalancesFromGroups(groups = [], groupExpensesByGroupId = {}, currentUserId) {
  const currentId = normalizeId(currentUserId);
  if (!currentId) {
    return [];
  }

  return (Array.isArray(groups) ? groups : []).flatMap((group) => {
    const expenses = Array.isArray(groupExpensesByGroupId[group.id]) ? groupExpensesByGroupId[group.id] : [];
    const balances = calculateGroupBalancesFromExpenses(expenses, group);
    return balances.filter((item) => item.fromUserId === currentId || item.toUserId === currentId);
  });
}

export {
  applySettledStatus,
  buildBalanceKey,
  getBalancePerspective,
  getSettledMap,
  markBalanceSettled,
  calculateGroupBalancesFromExpenses,
  calculateUserBalancesFromGroups
};
