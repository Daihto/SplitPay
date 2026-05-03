import axios from "axios";

const defaultBaseURL = import.meta.env.VITE_API_URL || "http://192.168.0.159:8080";
const emulatorBaseURL = "http://10.0.2.2:8080";
let baseURL = defaultBaseURL;

if (typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent)) {
  baseURL = emulatorBaseURL;
} else if (typeof window !== "undefined" && window.location.hostname === "10.0.2.2") {
  baseURL = emulatorBaseURL;
}

const api = axios.create({
  baseURL
});

export function getApiErrorMessage(error, fallbackMessage = "Request failed.") {
  const backendMessage = error?.response?.data?.message;
  if (backendMessage) {
    return backendMessage;
  }

  // When backend is down or blocked, axios has no response object.
  if (error?.request && !error?.response) {
    return `Cannot connect to backend at ${baseURL}. Please check your backend service and try again.`;
  }

  return fallbackMessage;
}

function getAuthHeaders() {
  const user = JSON.parse(localStorage.getItem("splitpayUser"));
  if (!user?.token) {
    return {};
  }

  return {
    Authorization: `Bearer ${user.token}`
  };
}

export async function registerUser(payload) {
  const response = await api.post("/api/auth/register", payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post("/api/auth/login", payload);
  return response.data;
}

export async function getGroups() {
  const response = await api.get("/api/groups", { headers: getAuthHeaders() });
  return response.data;
}

export async function createGroup(payload) {
  const response = await api.post("/api/groups", payload, { headers: getAuthHeaders() });
  return response.data;
}

export async function getGroupById(groupId) {
  const response = await api.get(`/api/groups/${groupId}`, { headers: getAuthHeaders() });
  return response.data;
}

export async function addMemberToGroup(groupId, payload) {
  const response = await api.post(`/api/groups/${groupId}/members`, payload, { headers: getAuthHeaders() });
  return response.data;
}

export async function addExpense(payload) {
  const response = await api.post("/api/expenses", payload, { headers: getAuthHeaders() });
  return response.data;
}

export async function getGroupExpenses(groupId) {
  const response = await api.get(`/api/groups/${groupId}/expenses`, { headers: getAuthHeaders() });
  return response.data;
}

export async function getGroupBalances(groupId) {
  const response = await api.get(`/api/groups/${groupId}/balances`, { headers: getAuthHeaders() });
  return response.data;
}

export async function getUserBalances(userId) {
  const response = await api.get(`/api/users/${userId}/balances`, { headers: getAuthHeaders() });
  return response.data;
}

export async function updateUserProfile(userId, payload) {
  const response = await api.put(`/api/users/${userId}`, payload, { headers: getAuthHeaders() });
  return response.data;
}

export async function updateUserPassword(userId, payload) {
  const response = await api.put(`/api/users/${userId}/password`, payload, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function uploadUserAvatar(userId, file) {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post(`/api/users/${userId}/avatar`, formData, {
    headers: getAuthHeaders()
  });

  return response.data;
}
