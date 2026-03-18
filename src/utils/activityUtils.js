function getActivityStorageKey(userId) {
  return `splitpayActivity:${userId}`;
}

function getActivityItems(userId) {
  if (!userId) {
    return [];
  }

  const raw = localStorage.getItem(getActivityStorageKey(userId));
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addActivityItem(userId, item) {
  if (!userId) {
    return;
  }

  const activityItems = getActivityItems(userId);
  const nextItems = [{ ...item, id: Date.now() }, ...activityItems].slice(0, 50);
  localStorage.setItem(getActivityStorageKey(userId), JSON.stringify(nextItems));
}

export { addActivityItem, getActivityItems };
