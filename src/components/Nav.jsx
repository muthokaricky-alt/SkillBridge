import { ME } from "../data.js";

export default function Nav({ page, nav, search, setSearch, myCoins, incomingCount }) {
  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#E5E5E5] h-16 flex items-center gap-2 px-6">
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

      <div className="flex gap-1 flex-1">
        <button className={`ntab${page === "discover" ? " on" : ""}`} onClick={() => nav("discover")}>Discover</button>
        <button className={`ntab${page === "profile" ? " on" : ""}`} onClick={() => nav("profile")}>My Profile</button>
        <button className={`ntab${page === "requests" ? " on" : ""} relative`} onClick={() => nav("requests")}>
          Requests
          {incomingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          )}
        </button>
        <button className={`ntab${page === "schedule" ? " on" : ""}`} onClick={() => nav("schedule")}>Schedule</button>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="flex items-center gap-2 bg-[#FAFAFA] border border-[#E5E5E5] rounded-full px-3.5 py-2">
          <svg className="w-3.5 h-3.5 text-[#999]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="bg-transparent border-none outline-none text-sm text-[#111] placeholder-[#999] w-24"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3.5 py-2 text-emerald-700 text-xs font-semibold">
          <span>◈</span>
          <span>{myCoins}</span>
        </div>

        <div
          onClick={() => nav("profile")}
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-105 transition-transform"
          style={{ background: ME.color + "1A", color: ME.color }}
        >
          {ME.initials}
        </div>
      </div>
    </nav>
  );
}
