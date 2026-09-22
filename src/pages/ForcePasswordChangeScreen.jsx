import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

// Shown instead of the main app when user.mustChangePassword is true —
// either because they've never changed the shared default password
// ("1234"), or because an admin just reset their password directly (see
// server/db.js adminSetPassword, which re-sets this flag on purpose).
// There's deliberately no way to dismiss this without succeeding.
export default function ForcePasswordChangeScreen() {
  const { user, updateUser, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    if (newPassword === "1234") {
      setError("Please choose something other than the default password");
      return;
    }
    setSubmitting(true);
    try {
      await api.changePassword(oldPassword, newPassword);
      updateUser({ mustChangePassword: false });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full bg-[var(--sb-surface-alt)] border border-[var(--sb-border)] rounded-2xl px-3.5 py-2.5 text-sm text-[var(--sb-text-primary)] outline-none focus:border-emerald-400 focus:bg-[var(--sb-surface)] placeholder-[var(--sb-text-tertiary)]";

  return (
    <div className="min-h-screen bg-[var(--sb-bg)] text-[var(--sb-text-primary)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="card">
          <h1 className="font-semibold text-lg mb-1 font-display">Set a new password</h1>
          <p className="text-sm text-[var(--sb-text-secondary)] mb-5">
            {user?.name}, you're still on the default password — pick a new one to continue into SkillBridge.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            <input
              type="password" required placeholder="Current password" value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)} className={inputClass}
            />
            <input
              type="password" required minLength={4} placeholder="New password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} className={inputClass}
            />
            <input
              type="password" required minLength={4} placeholder="Confirm new password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit" disabled={submitting}
              className="w-full py-2.5 bg-[var(--sb-inverse)] hover:bg-emerald-600 text-[var(--sb-inverse-text)] rounded-2xl text-xs font-semibold mt-1 transition-all disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Set new password & continue"}
            </button>
          </form>
        </div>
        <button onClick={logout} className="text-xs text-[var(--sb-text-tertiary)] hover:underline mt-4 mx-auto block">
          Log out instead
        </button>
      </div>
    </div>
  );
}
