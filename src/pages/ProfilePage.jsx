import { useState } from "react";
import { getAvatarColor } from "../utils.js";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import SkillTag from "../components/SkillTag.jsx";

export default function ProfilePage({ user, myOffers, myWants, myCoins, sessionsCount, coinHistory = [], onAddSkill, onRemoveSkill, nav }) {
  const avatarColor = getAvatarColor(user.name);
  return (
    <div id="page-profile" className="page on max-w-5xl mx-auto px-6 py-10">
      <div className="mb-7">
        <h1 className="text-3xl font-semibold tracking-tight mb-2 font-display">
          My <em className="text-emerald-500 not-italic">Profile</em>
        </h1>
        <p className="text-sm text-[var(--sb-text-secondary)]">Your knowledge is your currency.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
        <div className="flex flex-col gap-4 sticky top-24 h-fit">
          <div className="card">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold mb-4"
              style={{ background: avatarColor + "1A", color: avatarColor }}
            >
              {user.initials}
            </div>

            <div className="font-semibold text-lg mb-0.5 font-display">{user.name}</div>
            <div className="text-sm text-[var(--sb-text-secondary)] mb-1">{user.dept}{user.estate ? ` · ${user.estate}` : ""}</div>
            <div className="text-xs text-[var(--sb-text-tertiary)] mb-5">@{user.username} · {user.phone}</div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                [myOffers.length + myWants.length, "Skills"],
                [sessionsCount, "Sessions"],
                [user.rating ? `${user.rating} ★` : "New", "Rating"],
              ].map(([num, label]) => (
                <div key={label} className="bg-[var(--sb-surface-alt)] border border-[var(--sb-border-subtle)] rounded-2xl p-2.5 text-center">
                  <div className="font-semibold text-emerald-600 text-lg">{num}</div>
                  <div className="text-xs text-[var(--sb-text-tertiary)] uppercase tracking-wide mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-2xl p-3.5 mb-3">
              <div>
                <div className="text-xs font-semibold text-amber-700">◈ Skill Coins</div>
                <div className="text-xs text-[var(--sb-text-tertiary)]">For asymmetric exchanges</div>
              </div>
              <div className="text-2xl font-semibold text-amber-600">{myCoins}</div>
            </div>

            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-2xl px-3.5 py-2.5 mb-5">
              ⇄ Ujuzi wako ni currency yako
            </div>

            <button
              onClick={() => nav("discover")}
              className="w-full py-2.5 bg-[var(--sb-inverse)] hover:bg-emerald-600 text-[var(--sb-inverse-text)] rounded-2xl text-xs font-semibold mb-2 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
            >
              Find matches →
            </button>
            <button
              onClick={() => nav("requests")}
              className="w-full py-2.5 border border-[var(--sb-border)] hover:border-[var(--sb-text-tertiary)] text-[var(--sb-text-secondary)] rounded-2xl text-xs font-semibold transition-all bg-[var(--sb-surface)]"
            >
              View requests
            </button>
          </div>

          <div className="card">
            <div className="font-semibold text-xs mb-3.5 font-display flex items-center gap-1.5 text-amber-700 uppercase tracking-wider">
              <span>◈</span> Coin Activity Log
            </div>
            <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
              {coinHistory.length === 0 ? (
                <div className="text-center py-4 text-[var(--sb-text-tertiary)] text-xs">No transactions yet</div>
              ) : (
                coinHistory.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs border-b border-[var(--sb-border-subtle)] pb-2 last:border-b-0 last:pb-0">
                    <div className="min-w-0 pr-2">
                      <div className="font-medium text-[var(--sb-text-secondary)] truncate" title={item.action}>
                        {item.action}
                      </div>
                      <div className="text-[10px] text-[var(--sb-text-tertiary)]">{item.date}</div>
                    </div>
                    <div className={`font-semibold shrink-0 text-sm ${item.change > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                      {item.change > 0 ? `+${item.change}` : item.change} ◈
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SkillSection
            type="offer" skills={myOffers} title="Skills I can teach"
            dotColor="bg-emerald-500" placeholder="e.g. Python, Guitar…"
            onAdd={onAddSkill} onRemove={onRemoveSkill}
          />
          <SkillSection
            type="want" skills={myWants} title="Skills I want to learn"
            dotColor="bg-violet-500" placeholder="e.g. Spanish, React…"
            onAdd={onAddSkill} onRemove={onRemoveSkill}
          />
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
}

function ChangePasswordCard() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null); // null | { type: "error"|"success", msg }
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", msg: "New passwords don't match" });
      return;
    }
    setSubmitting(true);
    try {
      await api.changePassword(oldPassword, newPassword);
      setStatus({ type: "success", msg: "Password changed ✓" });
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full bg-[var(--sb-surface-alt)] border border-[var(--sb-border)] rounded-2xl px-3.5 py-2.5 text-sm text-[var(--sb-text-primary)] outline-none focus:border-emerald-400 focus:bg-[var(--sb-surface)] placeholder-[var(--sb-text-tertiary)]";

  return (
    <div className="card">
      <div className="font-semibold text-sm mb-3.5 font-display">Change password</div>
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
        {status && (
          <p className={`text-xs ${status.type === "error" ? "text-red-600" : "text-emerald-600"}`}>{status.msg}</p>
        )}
        <button
          type="submit" disabled={submitting}
          className="w-full py-2.5 bg-[var(--sb-inverse)] hover:bg-emerald-600 text-[var(--sb-inverse-text)] rounded-2xl text-xs font-semibold transition-all disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

function SkillSection({ type, skills, title, dotColor, placeholder, onAdd, onRemove }) {
  const [value, setValue] = useState("");

  function submit() {
    onAdd(type, value);
    setValue("");
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3.5">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="font-semibold text-sm font-display">{title}</span>
        <span className="ml-auto text-xs text-[var(--sb-text-tertiary)]">{skills.length} skill{skills.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {skills.length === 0
          ? <span className="text-xs text-[var(--sb-text-tertiary)]">None added yet</span>
          : skills.map((s, i) => (
            <SkillTag key={s + i} label={s} variant={type} onRemove={() => onRemove(type, i)} />
          ))}
      </div>

      <div className="flex gap-2">
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          className="flex-1 bg-[var(--sb-surface-alt)] border border-[var(--sb-border)] rounded-2xl px-3.5 py-2.5 text-sm text-[var(--sb-text-primary)] outline-none focus:border-emerald-400 focus:bg-[var(--sb-surface)] placeholder-[var(--sb-text-tertiary)]"
        />
        <button
          onClick={submit}
          className="px-4 py-2.5 bg-[var(--sb-inverse)] hover:bg-emerald-600 text-[var(--sb-inverse-text)] rounded-2xl text-xs font-semibold transition-all"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

