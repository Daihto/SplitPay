import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080"
});

export function getApiErrorMessage(error, fallbackMessage = "Request failed.") {
  const backendMessage = error?.response?.data?.message;
  if (backendMessage) {
    return backendMessage;
  }

  // When backend is down or blocked, axios has no response object.
  if (error?.request && !error?.response) {
    return "Cannot connect to backend at http://localhost:8080. Please start your Spring Boot server and try again.";
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
