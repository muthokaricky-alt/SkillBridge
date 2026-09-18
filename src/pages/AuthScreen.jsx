import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthScreen() {
  const [mode, setMode] = useState("login"); // "login" | "signup"

  return (
    <div className="min-h-screen bg-[var(--sb-bg)] text-[var(--sb-text-primary)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <svg width="32" height="32" viewBox="0 0 120 120" aria-hidden="true">
            <rect x="0" y="0" width="120" height="120" rx="16" fill="#ECFDF5" />
            <rect x="16" y="30" width="88" height="60" rx="6" fill="#10B981" />
            <rect x="20" y="34" width="80" height="52" rx="4" fill="none" stroke="#ECFDF5" strokeWidth="1.5" />
            <circle cx="60" cy="60" r="16" fill="none" stroke="#ECFDF5" strokeWidth="1.5" />
            <text x="60" y="68" fontFamily="'Space Grotesk',sans-serif" fontSize="26" fontWeight="700" fill="#ECFDF5" textAnchor="middle">S</text>
          </svg>
          <span className="font-semibold text-xl font-display">
            Skill<span className="text-emerald-500">Bridge</span>
          </span>
        </div>

        <div className="card">
          {mode === "login" ? <LoginForm /> : <SignupForm onDone={() => setMode("login")} />}
        </div>

        <p className="text-center text-xs text-[var(--sb-text-tertiary)] mt-5">
          {mode === "login" ? (
            <>Don't have an account?{" "}
              <button onClick={() => setMode("signup")} className="text-emerald-600 font-semibold hover:underline">
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-emerald-600 font-semibold hover:underline">
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-[var(--sb-surface-alt)] border border-[var(--sb-border)] rounded-2xl px-3.5 py-2.5 text-sm text-[var(--sb-text-primary)] outline-none focus:border-emerald-400 focus:bg-[var(--sb-surface)] placeholder-[var(--sb-text-tertiary)]";
const labelClass = "text-xs font-semibold uppercase tracking-wider text-[var(--sb-text-tertiary)] mb-1.5 block";
const submitClass =
  "w-full py-2.5 bg-[var(--sb-inverse)] hover:bg-emerald-600 text-[var(--sb-inverse-text)] rounded-2xl text-xs font-semibold mt-2 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0";

function LoginForm() {
  const { login, authError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await login(username, password);
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="font-semibold text-lg mb-1 font-display">Welcome back</h1>
      <p className="text-sm text-[var(--sb-text-secondary)] mb-5">Log in to your SkillBridge account.</p>

      <label className={labelClass} htmlFor="login-username">Username</label>
      <input id="login-username" required autoComplete="username" value={username}
        onChange={(e) => setUsername(e.target.value)} className={inputClass} placeholder="e.g. billamani" />

      <label className={labelClass + " mt-4"} htmlFor="login-password">Password</label>
      <input id="login-password" type="password" required autoComplete="current-password" value={password}
        onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••" />

      {authError && <p className="text-xs text-red-600 mt-3">{authError}</p>}

      <button type="submit" disabled={submitting} className={submitClass}>
        {submitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}

function SignupForm({ onDone }) {
  const { signup, authError } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await signup({ name, username, phone, password });
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="font-semibold text-lg mb-1 font-display">Create your account</h1>
      <p className="text-sm text-[var(--sb-text-secondary)] mb-5">
        Your initials are generated from your full name automatically.
      </p>

      <label className={labelClass} htmlFor="signup-name">Full name</label>
      <input id="signup-name" required value={name} onChange={(e) => setName(e.target.value)}
        className={inputClass} placeholder="e.g. Vini Jr" />

      <label className={labelClass + " mt-4"} htmlFor="signup-username">Username</label>
      <input id="signup-username" required autoComplete="username" value={username}
        onChange={(e) => setUsername(e.target.value)} className={inputClass} placeholder="e.g. vinijr" />

      <label className={labelClass + " mt-4"} htmlFor="signup-phone">Phone number</label>
      <input id="signup-phone" required value={phone} onChange={(e) => setPhone(e.target.value)}
        className={inputClass} placeholder="07XXXXXXXX" />

      <label className={labelClass + " mt-4"} htmlFor="signup-password">Password</label>
      <input id="signup-password" type="password" required minLength={4} autoComplete="new-password"
        value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="At least 4 characters" />

      {authError && <p className="text-xs text-red-600 mt-3">{authError}</p>}

      <button type="submit" disabled={submitting} className={submitClass}>
        {submitting ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}
