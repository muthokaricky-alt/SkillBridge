import { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../api.js";

const STORAGE_KEY = "skillbridge-token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authError, setAuthError] = useState("");

  // On first load, see if a token was saved from a previous visit and
  // whether it's still valid — this is what keeps someone logged in
  // across a page refresh instead of forcing a login every time.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setCheckingSession(false);
      return;
    }
    setAuthToken(stored);
    api.getMe()
      .then(({ user }) => setUser(user))
      .catch(() => {
        // token expired / was revoked / server restarted and lost it
        localStorage.removeItem(STORAGE_KEY);
        setAuthToken(null);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  async function login(username, password) {
    setAuthError("");
    try {
      const { token, user } = await api.login({ username, password });
      localStorage.setItem(STORAGE_KEY, token);
      setAuthToken(token);
      setUser(user);
      return true;
    } catch (err) {
      setAuthError(err.message || "Couldn't log in");
      return false;
    }
  }

  async function signup(fields) {
    setAuthError("");
    try {
      const { token, user } = await api.signup(fields);
      localStorage.setItem(STORAGE_KEY, token);
      setAuthToken(token);
      setUser(user);
      return true;
    } catch (err) {
      setAuthError(err.message || "Couldn't sign up");
      return false;
    }
  }

  async function logout() {
    try { await api.logout(); } catch { /* token may already be dead — fine either way */ }
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    setUser(null);
  }

  // Lets ProfilePage/Nav reflect a change immediately (e.g. after an admin
  // edits your own account, or your coin balance changes) without a
  // full re-login.
  function updateUser(patch) {
    setUser((u) => (u ? { ...u, ...patch } : u));
  }

  return (
    <AuthContext.Provider value={{ user, checkingSession, authError, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
