import axios from "axios";

// Production backend URL - defaults to Render backend
const defaultBaseURL = import.meta.env.VITE_API_URL || "https://splitpaybackend.onrender.com";
const emulatorBaseURL = "http://10.0.2.2:8080"; // Local Android emulator
let baseURL = defaultBaseURL;

// Use emulator backend for Android development
if (typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent)) {
  baseURL = emulatorBaseURL;
} else if (typeof window !== "undefined" && window.location.hostname === "10.0.2.2") {
  baseURL = emulatorBaseURL;
}

const api = axios.create({
  baseURL
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 [API Request] ${config.method.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error("❌ [Request Error]", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Response] ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error("❌ [Response Error]", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    return Promise.reject(error);
  }
);

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
  console.log("📝 [Register] Starting registration process with email:", payload.email);
  try {
    const response = await api.post("/api/auth/register", payload);
    console.log("📝 [Register] Success! Response data:", response.data);
    return response.data;
  } catch (error) {
    console.error("📝 [Register] Failed!", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
}

export async function loginUser(payload) {
  console.log("🔐 [Login] Starting login process with payload:", { email: payload.email });
  try {
    const response = await api.post("/api/auth/login", payload);
    console.log("🔐 [Login] Success! Response data:", response.data);
    return response.data;
  } catch (error) {
    console.error("🔐 [Login] Failed!", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
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
