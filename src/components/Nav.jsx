import { useState } from "react";
import { getAvatarColor } from "../utils.js";
import ThemeToggle from "./ThemeToggle.jsx";

const TABS = [
  { id: "discover", label: "Discover" },
  { id: "profile", label: "My Profile" },
  { id: "requests", label: "Requests" },
  { id: "schedule", label: "Schedule" },
];

export default function Nav({ page, nav, search, setSearch, myCoins, incomingCount, theme, onToggleTheme, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarColor = getAvatarColor(user.name);
  const tabs = user.role === "admin" ? [...TABS, { id: "admin", label: "Admin" }] : TABS;

  function goTo(p) {
    nav(p);
    setMenuOpen(false);
  }

  return (
    <nav className="sticky top-0 z-40 bg-[var(--sb-surface)]/90 backdrop-blur-xl border-b border-[var(--sb-border)]">
      <div className="h-16 flex items-center gap-2 px-4 sm:px-6">
        <div className="flex items-center gap-2 mr-3">
          <svg width="32" height="32" viewBox="0 0 120 120" aria-hidden="true">
            <rect x="0" y="0" width="120" height="120" rx="16" fill="#ECFDF5" />
            <rect x="16" y="30" width="88" height="60" rx="6" fill="#10B981" />
            <rect x="20" y="34" width="80" height="52" rx="4" fill="none" stroke="#ECFDF5" strokeWidth="1.5" />
            <circle cx="60" cy="60" r="16" fill="none" stroke="#ECFDF5" strokeWidth="1.5" />
            <text x="60" y="68" fontFamily="'Space Grotesk',sans-serif" fontSize="26" fontWeight="700" fill="#ECFDF5" textAnchor="middle">
              S
            </text>
          </svg>
          <span className="font-semibold text-lg font-display">
            Skill<span className="text-emerald-500">Bridge</span>
          </span>
        </div>

        {/* Tab links — hidden below md, shown in the slide-down menu instead */}
        <div className="hidden md:flex gap-1 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`ntab${page === tab.id ? " on" : ""} relative`}
              onClick={() => nav(tab.id)}
              aria-current={page === tab.id ? "page" : undefined}
            >
              {tab.label}
              {tab.id === "requests" && incomingCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Search — collapses to icon-only on small screens */}
          <div className="hidden sm:flex items-center gap-2 bg-[var(--sb-surface-alt)] border border-[var(--sb-border)] rounded-full px-3.5 py-2">
            <svg className="w-3.5 h-3.5 text-[var(--sb-text-tertiary)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <label htmlFor="nav-search" className="sr-only">Search SkillBridge</label>
            <input
              id="nav-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="bg-transparent border-none outline-none text-sm text-[var(--sb-text-primary)] placeholder-[var(--sb-text-tertiary)] w-24 md:w-32"
            />
          </div>

          <div
            className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3.5 py-2 text-emerald-700 text-xs font-semibold"
            aria-label={`${myCoins} Skill Coins`}
          >
            <span aria-hidden="true">◈</span>
            <span>{myCoins}</span>
          </div>

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <button
            onClick={() => nav("profile")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-105 transition-transform"
            style={{ background: avatarColor + "1A", color: avatarColor }}
            aria-label="Go to my profile"
            title={user.name}
          >
            {user.initials}
          </button>

          <button
            onClick={onLogout}
            className="hidden md:block w-9 h-9 rounded-full flex items-center justify-center text-[var(--sb-text-secondary)] hover:bg-[var(--sb-surface-alt)] transition-colors"
            aria-label="Log out"
            title="Log out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>

          {/* Hamburger — only shown below md */}
          <button
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[var(--sb-text-secondary)] hover:bg-[var(--sb-surface-alt)] transition-colors relative"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
            {!menuOpen && incomingCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-[var(--sb-surface)]" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu: tabs + search, only below md */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--sb-border)] bg-[var(--sb-surface)] px-4 py-3 flex flex-col gap-1">
          <div className="flex items-center gap-2 bg-[var(--sb-surface-alt)] border border-[var(--sb-border)] rounded-full px-3.5 py-2 mb-2 sm:hidden">
            <svg className="w-3.5 h-3.5 text-[var(--sb-text-tertiary)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <label htmlFor="nav-search-mobile" className="sr-only">Search SkillBridge</label>
            <input
              id="nav-search-mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="bg-transparent border-none outline-none text-sm text-[var(--sb-text-primary)] placeholder-[var(--sb-text-tertiary)] flex-1"
            />
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`ntab text-left${page === tab.id ? " on" : ""} relative`}
              onClick={() => goTo(tab.id)}
              aria-current={page === tab.id ? "page" : undefined}
            >
              {tab.label}
              {tab.id === "requests" && incomingCount > 0 && (
                <span className="ml-2 text-xs text-emerald-600 font-semibold">({incomingCount})</span>
              )}
            </button>
          ))}
          <button onClick={onLogout} className="ntab text-left text-red-600">
            Log out
          </button>
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-[var(--sb-border-subtle)]">
            <span className="text-xs text-[var(--sb-text-tertiary)] px-2">
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </span>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>
      )}
    </nav>
  );
}
