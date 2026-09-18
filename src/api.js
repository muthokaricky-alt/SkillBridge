// src/api.js
//
// Every network call the frontend makes goes through this file.
// Components never call `fetch` directly — they call a function here,
// which keeps the URL, headers, and error handling in one place instead
// of repeated in every component.

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Holds the current session's bearer token in memory. Set by AuthContext
// on login/signup/app-load, cleared on logout. Kept as a plain module
// variable (not re-read from localStorage on every request) so token
// handling stays in one place.
let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Request failed with status ${res.status}`);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null; // no content (e.g. DELETE)
  return res.json();
}

export const api = {
  // auth
  signup: (payload) => request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  getMe: () => request("/auth/me"),

  // admin
  adminGetUsers: () => request("/admin/users"),
  adminCreateUser: (payload) => request("/admin/users", { method: "POST", body: JSON.stringify(payload) }),
  adminUpdateUser: (id, fields) => request(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(fields) }),
  adminSetPassword: (id, newPassword) =>
    request(`/admin/users/${id}/password`, { method: "PATCH", body: JSON.stringify({ newPassword }) }),
  adminDeleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),
  adminGetAuditLog: () => request("/admin/audit-log"),

  // users
  getUsers: () => request("/users"),

  // requests
  getRequests: () => request("/requests"),
  createRequest: (payload) =>
    request("/requests", { method: "POST", body: JSON.stringify(payload) }),
  updateRequestStatus: (id, status) =>
    request(`/requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteRequest: (id) =>
    request(`/requests/${id}`, { method: "DELETE" }),

  // sessions
  getSessions: () => request("/sessions"),
  createSession: (payload) =>
    request("/sessions", { method: "POST", body: JSON.stringify(payload) }),
  markSessionReviewed: (id) =>
    request(`/sessions/${id}`, { method: "PATCH", body: JSON.stringify({ reviewed: true }) }),

  // profile (always "my" profile — the backend derives which user from
  // the auth token, not from anything passed here)
  getProfile: () => request("/profile"),
  updateProfile: (fields) => request("/profile", { method: "PATCH", body: JSON.stringify(fields) }),
  addProfileSkill: (type, value) =>
    request("/profile/skills", { method: "POST", body: JSON.stringify({ type, value }) }),
  removeProfileSkill: (type, value) =>
    request(`/profile/skills/${type}/${encodeURIComponent(value)}`, { method: "DELETE" }),
  adjustCoins: (delta, reason) =>
    request("/profile/coins", { method: "PATCH", body: JSON.stringify({ delta, reason }) }),
  changePassword: (oldPassword, newPassword) =>
    request("/auth/password", { method: "PATCH", body: JSON.stringify({ oldPassword, newPassword }) }),

  // logistics (upstream — proxied through our backend to Maji Website;
  // see server/services/majiClient.js). Note: no getPaymentMethods here —
  // Maji's real contract only exposes a single customer's own saved
  // payment method, not a list of checkout options, so that capability
  // doesn't exist upstream. See CONTRACT_QUESTIONS.md.
  getStations: (estate) =>
    request(`/logistics/stations${estate ? `?estate=${encodeURIComponent(estate)}` : ""}`),
};
