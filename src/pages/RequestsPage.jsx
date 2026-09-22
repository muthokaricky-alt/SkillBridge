import Avatar from "../components/Avatar.jsx";
import SkillTag from "../components/SkillTag.jsx";

export default function RequestsPage({ requests, users, activeReqTab, setActiveReqTab, incomingCount, onAccept, onDecline, decliningId, currentUserId }) {
  const list = requests.filter((r) => r.status === activeReqTab);

  return (
    <div id="page-requests" className="page on max-w-5xl mx-auto px-6 py-10">
      <div className="mb-7">
        <h1 className="text-3xl font-semibold tracking-tight mb-2 font-display">
          Skill <em className="text-emerald-500 not-italic">Requests</em>
        </h1>
        <p className="text-sm text-[var(--sb-text-secondary)]">People who want to exchange skills with you.</p>
      </div>

      <div className="flex gap-2 mb-5">
        <button className={`rtab${activeReqTab === "incoming" ? " on" : ""}`} onClick={() => setActiveReqTab("incoming")}>
          Incoming <span className="text-xs opacity-70">{incomingCount > 0 ? `(${incomingCount})` : ""}</span>
        </button>
        <button className={`rtab${activeReqTab === "sent" ? " on" : ""}`} onClick={() => setActiveReqTab("sent")}>Sent</button>
        <button className={`rtab${activeReqTab === "accepted" ? " on" : ""}`} onClick={() => setActiveReqTab("accepted")}>Accepted</button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 text-[var(--sb-text-tertiary)]">
          <div className="text-4xl mb-3">📬</div>
          <div className="font-semibold text-[var(--sb-text-secondary)] mb-1">Nothing here yet</div>
          <div className="text-sm">
            {activeReqTab === "incoming"
              ? "Requests will appear here when someone wants to swap."
              : "Send a request from the Discover page."}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {list.map((r) => (
            <RequestCard key={r.id} req={r} users={users} onAccept={onAccept} onDecline={onDecline} declining={decliningId === r.id} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({ req, users, onAccept, onDecline, declining, currentUserId }) {
  // Whichever side ISN'T me is "the other party" to display — correct
  // regardless of whether this is an incoming or a sent request, now that
  // fromId/toId carry real sender/recipient meaning instead of both being
  // set to the same value.
  const userId = req.fromId === currentUserId ? req.toId : req.fromId;
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  const isIncoming = req.status === "incoming";
  const isAccepted = req.status === "accepted";
  const isCoin = req.type === "coin";

  return (
    <div
      className="card flex gap-3.5"
      style={{ opacity: declining ? 0.3 : 1, pointerEvents: declining ? "none" : "auto", transition: "opacity 0.4s" }}
    >
      <Avatar name={user.name} initials={user.initials} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm mb-0.5">{user.name}</div>
        <div className="text-xs text-[var(--sb-text-tertiary)] mb-2.5">{user.dept} · ★ {user.rating} ({user.reviews} reviews)</div>
        <div className="flex items-center gap-2 flex-wrap mb-2.5">
          {isCoin ? (
            <>
              <span className="text-xs font-semibold text-amber-600">◈ Coin request</span>
              <span className="text-[var(--sb-text-tertiary)]">→</span>
              <SkillTag label={req.want} variant="want" />
            </>
          ) : (
            <>
              <SkillTag label={req.offer} variant="offer" />
              <span className="text-[var(--sb-text-tertiary)]">⇄</span>
              <SkillTag label={req.want} variant="want" />
            </>
          )}
        </div>
        <p className="text-xs text-[var(--sb-text-tertiary)] italic border-l-2 border-[var(--sb-border-subtle)] pl-2.5 mb-1">"{req.msg}"</p>
        <div className="text-xs text-[var(--sb-text-tertiary)]">{req.time}</div>
      </div>
      <div className="flex flex-col gap-2 flex-shrink-0">
        {isIncoming ? (
          <>
            <button
              onClick={() => onAccept(req.id)}
              className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-all"
            >
              Accept
            </button>
            <button
              onClick={() => onDecline(req.id)}
              className="px-3.5 py-2 border border-[var(--sb-border)] text-[var(--sb-text-secondary)] rounded-2xl text-xs font-semibold hover:text-red-600 hover:border-red-200 transition-all bg-[var(--sb-surface)]"
            >
              Decline
            </button>
          </>
        ) : isAccepted ? (
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold">
            ✓ Active
          </span>
        ) : (
          <span className="px-3.5 py-1.5 bg-violet-50 text-violet-700 border border-violet-100 rounded-full text-xs font-semibold">
            Pending
          </span>
        )}
      </div>
    </div>
  );
}
