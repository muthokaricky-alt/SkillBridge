// src/api.js
//
// Every network call the frontend makes goes through this file.
// Components never call `fetch` directly — they call a function here,
// which keeps the URL, headers, and error handling in one place instead
// of repeated in every component.

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) return null; // no content (e.g. DELETE)
  return res.json();
}

export const api = {
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

  // profile
  getProfile: () => request("/profile"),
  addProfileSkill: (type, value) =>
    request("/profile/skills", { method: "POST", body: JSON.stringify({ type, value }) }),
  removeProfileSkill: (type, value) =>
    request(`/profile/skills/${type}/${encodeURIComponent(value)}`, { method: "DELETE" }),
  adjustCoins: (delta, reason) =>
    request("/profile/coins", { method: "PATCH", body: JSON.stringify({ delta, reason }) }),
};
