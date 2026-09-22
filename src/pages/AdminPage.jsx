import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import ModalShell from "../components/modals/ModalShell.jsx";

export default function AdminPage() {
  const { user: currentUser, updateUser } = useAuth();
  const [users, setUsers] = useState(null);
  const [auditLog, setAuditLog] = useState(null);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null); // null | user object
  const [addingUser, setAddingUser] = useState(false);
  const [resettingUser, setResettingUser] = useState(null); // null | user object
  const [busyId, setBusyId] = useState(null);

  function loadUsers() {
    api.adminGetUsers().then(setUsers).catch((err) => setError(err.message));
  }
  function loadAuditLog() {
    api.adminGetAuditLog().then(setAuditLog).catch((err) => setError(err.message));
  }

  useEffect(() => { loadUsers(); loadAuditLog(); }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this user? This can't be undone.")) return;
    setBusyId(id);
    try {
      await api.adminDeleteUser(id);
      setUsers((list) => list.filter((u) => u.id !== id));
      loadAuditLog();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveEdit(fields) {
    const updated = await api.adminUpdateUser(editingUser.id, fields);
    setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)));
    // If the admin just edited their OWN account, reflect it immediately
    // in the nav/profile without needing to log out and back in.
    if (updated.id === currentUser.id) updateUser(updated);
    setEditingUser(null);
    loadAuditLog();
  }

  async function handleCreate(fields) {
    const created = await api.adminCreateUser(fields);
    setUsers((list) => [...list, created]);
    setAddingUser(false);
    loadAuditLog();
  }

  async function handleResetPassword(newPassword) {
    await api.adminSetPassword(resettingUser.id, newPassword);
    setResettingUser(null);
    loadAuditLog();
  }

  return (
    <div className="page on max-w-6xl mx-auto px-6 py-10">
      <div className="mb-7 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2 font-display">
            Admin <em className="text-emerald-500 not-italic">Dashboard</em>
          </h1>
          <p className="text-sm text-[var(--sb-text-secondary)]">Every SkillBridge account, in one place.</p>
        </div>
        <button
          onClick={() => setAddingUser(true)}
          className="px-4 py-2.5 bg-[var(--sb-inverse)] hover:bg-emerald-600 text-[var(--sb-inverse-text)] rounded-2xl text-xs font-semibold transition-all"
        >
          + Register user
        </button>
      </div>

      {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

      {!users ? (
        <div className="card text-sm text-[var(--sb-text-tertiary)] py-6 text-center">Loading users…</div>
      ) : (
        <>
          {/* Desktop: full table. Hidden below md — a table with 7 columns
              doesn't reflow usefully on a phone-width screen, so mobile
              gets a stacked card list instead (below). */}
          <div className="card overflow-x-auto hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-[var(--sb-text-tertiary)] border-b border-[var(--sb-border-subtle)]">
                  <th className="pb-2 pr-3">Name</th>
                  <th className="pb-2 pr-3">Username</th>
                  <th className="pb-2 pr-3">Phone</th>
                  <th className="pb-2 pr-3">Dept</th>
                  <th className="pb-2 pr-3">Role</th>
                  <th className="pb-2 pr-3">Coins</th>
                  <th className="pb-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--sb-border-subtle)] last:border-0" style={{ opacity: busyId === u.id ? 0.4 : 1 }}>
                    <td className="py-2.5 pr-3 font-medium text-[var(--sb-text-primary)]">{u.name}</td>
                    <td className="py-2.5 pr-3 text-[var(--sb-text-secondary)]">{u.username}</td>
                    <td className="py-2.5 pr-3 text-[var(--sb-text-secondary)]">{u.phone}</td>
                    <td className="py-2.5 pr-3 text-[var(--sb-text-secondary)]">{u.dept}</td>
                    <td className="py-2.5 pr-3"><RoleBadge role={u.role} /></td>
                    <td className="py-2.5 pr-3 text-amber-600 font-semibold">{u.coins} ◈</td>
                    <td className="py-2.5 pr-3 text-right whitespace-nowrap">
                      <UserRowActions
                        user={u} currentUserId={currentUser.id} busy={busyId === u.id}
                        onEdit={() => setEditingUser(u)} onReset={() => setResettingUser(u)} onDelete={() => handleDelete(u.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: one card per user, same actions and data as the table. */}
          <div className="flex flex-col gap-3 md:hidden">
            {users.map((u) => (
              <div key={u.id} className="card" style={{ opacity: busyId === u.id ? 0.4 : 1 }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-[var(--sb-text-primary)]">{u.name}</div>
                    <div className="text-xs text-[var(--sb-text-secondary)]">@{u.username} · {u.phone}</div>
                  </div>
                  <RoleBadge role={u.role} />
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--sb-text-secondary)] mb-3">
                  <span>{u.dept}</span>
                  <span className="text-amber-600 font-semibold">{u.coins} ◈</span>
                </div>
                <div className="pt-2 border-t border-[var(--sb-border-subtle)]">
                  <UserRowActions
                    user={u} currentUserId={currentUser.id} busy={busyId === u.id}
                    onEdit={() => setEditingUser(u)} onReset={() => setResettingUser(u)} onDelete={() => handleDelete(u.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-6">
        <h2 className="font-semibold text-base mb-3 font-display">Audit log</h2>

        {!auditLog ? (
          <div className="card text-sm text-[var(--sb-text-tertiary)] py-6 text-center">Loading…</div>
        ) : auditLog.length === 0 ? (
          <div className="card text-sm text-[var(--sb-text-tertiary)] py-6 text-center">No admin actions yet.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="card overflow-x-auto hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-[var(--sb-text-tertiary)] border-b border-[var(--sb-border-subtle)]">
                    <th className="pb-2 pr-3">When</th>
                    <th className="pb-2 pr-3">Admin</th>
                    <th className="pb-2 pr-3">Action</th>
                    <th className="pb-2 pr-3">Target</th>
                    <th className="pb-2 pr-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((entry) => (
                    <tr key={entry.id} className="border-b border-[var(--sb-border-subtle)] last:border-0">
                      <td className="py-2.5 pr-3 text-[var(--sb-text-tertiary)] whitespace-nowrap">{entry.createdAt}</td>
                      <td className="py-2.5 pr-3 font-medium text-[var(--sb-text-primary)]">{entry.adminUsername}</td>
                      <td className="py-2.5 pr-3"><ActionBadge action={entry.action} /></td>
                      <td className="py-2.5 pr-3 text-[var(--sb-text-secondary)]">{entry.targetUsername || "—"}</td>
                      <td className="py-2.5 pr-3 text-[var(--sb-text-tertiary)]">{entry.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {auditLog.map((entry) => (
                <div key={entry.id} className="card">
                  <div className="flex items-center justify-between mb-1.5">
                    <ActionBadge action={entry.action} />
                    <span className="text-[10px] text-[var(--sb-text-tertiary)]">{entry.createdAt}</span>
                  </div>
                  <div className="text-xs text-[var(--sb-text-secondary)] mb-1">
                    <span className="font-medium text-[var(--sb-text-primary)]">{entry.adminUsername}</span>
                    {" → "}
                    {entry.targetUsername || "—"}
                  </div>
                  {entry.details && <div className="text-xs text-[var(--sb-text-tertiary)]">{entry.details}</div>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {editingUser && (
        <UserFormModal
          title={`Edit ${editingUser.name}`}
          initial={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleSaveEdit}
          isEdit
        />
      )}
      {addingUser && (
        <UserFormModal
          title="Register a new user"
          initial={{ name: "", username: "", phone: "", dept: "", role: "user" }}
          onClose={() => setAddingUser(false)}
          onSubmit={handleCreate}
        />
      )}
      {resettingUser && (
        <ResetPasswordModal
          user={resettingUser}
          onClose={() => setResettingUser(null)}
          onSubmit={handleResetPassword}
        />
      )}
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
      role === "admin"
        ? "text-violet-700 bg-violet-50 border-violet-100"
        : "text-[var(--sb-text-tertiary)] bg-[var(--sb-surface-alt)] border-[var(--sb-border)]"
    }`}>
      {role}
    </span>
  );
}

function ActionBadge({ action }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-emerald-700 bg-emerald-50 border-emerald-100">
      {action.replace(/_/g, " ")}
    </span>
  );
}

// Shared between the desktop table row and the mobile card, so the three
// actions (and the "can't touch your own account" rules) only exist once.
function UserRowActions({ user, currentUserId, busy, onEdit, onReset, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1 flex-wrap">
      <button
        onClick={onEdit}
        className="text-xs font-semibold text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
      >
        Edit
      </button>
      <button
        onClick={onReset}
        className="text-xs font-semibold text-amber-600 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg transition-colors"
      >
        Reset password
      </button>
      <button
        onClick={onDelete}
        disabled={user.id === currentUserId || busy}
        className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        title={user.id === currentUserId ? "You can't delete your own account while logged in as it" : undefined}
      >
        Delete
      </button>
    </div>
  );
}

const inputClass =
  "w-full bg-[var(--sb-surface-alt)] border border-[var(--sb-border)] rounded-2xl px-3.5 py-2.5 text-sm text-[var(--sb-text-primary)] outline-none focus:border-emerald-400 focus:bg-[var(--sb-surface)] placeholder-[var(--sb-text-tertiary)]";
const labelClass = "text-xs font-semibold uppercase tracking-wider text-[var(--sb-text-tertiary)] mb-1.5 block";

function UserFormModal({ title, initial, onClose, onSubmit, isEdit = false }) {
  const [name, setName] = useState(initial.name || "");
  const [username, setUsername] = useState(initial.username || "");
  const [phone, setPhone] = useState(initial.phone || "");
  const [password, setPassword] = useState("");
  const [dept, setDept] = useState(initial.dept || "");
  const [role, setRole] = useState(initial.role || "user");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        await onSubmit({ name, username, phone, dept, role });
      } else {
        if (!password) throw new Error("Password is required for a new account");
        await onSubmit({ name, username, phone, password, role });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell open title={title} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className={labelClass} htmlFor="uf-name">Name</label>
        <input id="uf-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />

        <label className={labelClass + " mt-3"} htmlFor="uf-username">Username</label>
        <input id="uf-username" required value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} />

        <label className={labelClass + " mt-3"} htmlFor="uf-phone">Phone</label>
        <input id="uf-phone" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="07XXXXXXXX" />

        {!isEdit && (
          <>
            <label className={labelClass + " mt-3"} htmlFor="uf-password">Password</label>
            <input id="uf-password" type="password" required minLength={4} value={password}
              onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </>
        )}

        <label className={labelClass + " mt-3"} htmlFor="uf-dept">Department</label>
        <input id="uf-dept" value={dept} onChange={(e) => setDept(e.target.value)} className={inputClass} />

        <label className={labelClass + " mt-3"} htmlFor="uf-role">Role</label>
        <select id="uf-role" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>

        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose} className="mo-cancel">Cancel</button>
          <button type="submit" disabled={submitting} className="mo-confirm">
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Register user"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ResetPasswordModal({ user, onClose, onSubmit }) {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(newPassword);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell open title={`Reset password for ${user.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <p className="text-xs text-[var(--sb-text-tertiary)] mb-3">
          This sets their password directly — they won't need their old one.
        </p>
        <label className={labelClass} htmlFor="rp-password">New password</label>
        <input id="rp-password" type="password" required minLength={4} value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)} className={inputClass} placeholder="At least 4 characters" />

        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose} className="mo-cancel">Cancel</button>
          <button type="submit" disabled={submitting} className="mo-confirm">
            {submitting ? "Saving…" : "Set new password"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
