import { MONTH_NAMES, WEEK_DAYS } from "../data.js";
import { formatDate } from "../utils.js";

export default function SchedulePage({
  calYear, calMonth, selectedDate, sessions,
  onChangeMonth, onSelectDay, onOpenSessionModal, onOpenReview,
}) {
  return (
    <div id="page-schedule" className="page on max-w-5xl mx-auto px-6 py-10">
      <div className="mb-7">
        <h1 className="text-3xl font-semibold tracking-tight mb-2 font-display">
          My <em className="text-emerald-500 not-italic">Schedule</em>
        </h1>
        <p className="text-sm text-[#666]">Upcoming sessions and availability.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <CalendarCard
          calYear={calYear} calMonth={calMonth} selectedDate={selectedDate}
          sessions={sessions} onChangeMonth={onChangeMonth} onSelectDay={onSelectDay}
        />
        <SessionsCard
          selectedDate={selectedDate} sessions={sessions}
          onOpenSessionModal={onOpenSessionModal} onOpenReview={onOpenReview}
        />
      </div>
    </div>
  );
}

function CalendarCard({ calYear, calMonth, selectedDate, sessions, onChangeMonth, onSelectDay }) {
  const sessionDays = new Set(
    sessions
      .filter((s) => { const d = new Date(s.date); return d.getFullYear() === calYear && d.getMonth() === calMonth; })
      .map((s) => new Date(s.date).getDate())
  );

  // getDay() returns 0 for Sunday — shift so the grid starts on Monday
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(<div key={"e" + i} />);

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getDate() === d && today.getMonth() === calMonth && today.getFullYear() === calYear;
    const isSelected = selectedDate?.d === d && selectedDate?.m === calMonth && selectedDate?.y === calYear;
    const hasSession = sessionDays.has(d);

    const cellClass = isSelected
      ? "bg-[#111] text-white"
      : isToday
        ? "border border-emerald-400 text-emerald-600 font-semibold"
        : "hover:bg-[#FAFAFA] text-[#333]";

    cells.push(
      <div
        key={d}
        onClick={() => onSelectDay(d)}
        className={`aspect-square flex items-center justify-center rounded-xl text-sm relative cursor-pointer transition-all ${cellClass}`}
      >
        {d}
        {hasSession && (
          <span
            className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
              isSelected ? "bg-white" : "bg-emerald-500"
            }`}
          />
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <span className="font-semibold text-base font-display">{MONTH_NAMES[calMonth]} {calYear}</span>
        <div className="flex gap-2">
          <button
            onClick={() => onChangeMonth(-1)}
            className="w-8 h-8 flex items-center justify-center border border-[#E5E5E5] rounded-xl text-[#666] hover:text-[#111] hover:bg-[#FAFAFA] transition-all text-sm"
          >
            ‹
          </button>
          <button
            onClick={() => onChangeMonth(1)}
            className="w-8 h-8 flex items-center justify-center border border-[#E5E5E5] rounded-xl text-[#666] hover:text-[#111] hover:bg-[#FAFAFA] transition-all text-sm"
          >
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold uppercase tracking-wider text-[#bbb] py-1">{d}</div>
        ))}
        {cells}
      </div>
    </div>
  );
}

function SessionsCard({ selectedDate, sessions, onOpenSessionModal, onOpenReview }) {
  const list = selectedDate
    ? sessions.filter((s) => { const d = new Date(s.date); return d.getDate() === selectedDate.d && d.getMonth() === selectedDate.m; })
    : sessions.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);

  const title = selectedDate ? formatDate(new Date(selectedDate.y, selectedDate.m, selectedDate.d)) : "Upcoming sessions";

  return (
    <div className="card">
      <div className="font-semibold text-sm mb-3.5 font-display">{title}</div>

      {list.length === 0 ? (
        <div className="text-center py-8 text-[#999] text-sm">No sessions{selectedDate ? " on this day" : ""}</div>
      ) : (
        list.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-start gap-3 py-3.5 ${i === list.length - 1 ? "" : "border-b border-[#F0F0F0]"}`}
          >
            <div className="w-10 flex-shrink-0 text-center">
              <div className="font-semibold text-emerald-600 text-xs">{s.time}</div>
            </div>
            <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: s.color }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#111]">{s.with}</div>
              <div className="text-xs text-[#777]">{s.skill}</div>
              <div className="text-xs text-[#bbb]">{s.dur} min</div>
            </div>
            {!s.reviewed ? (
              <button
                onClick={() => onOpenReview(s.id)}
                className="text-xs px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl font-semibold hover:bg-amber-500 hover:text-white transition-all"
              >
                Rate
              </button>
            ) : (
              <span className="text-xs text-emerald-600">✓</span>
            )}
          </div>
        ))
      )}

      <button
        onClick={onOpenSessionModal}
        className="w-full mt-4 py-2.5 bg-[#111] hover:bg-emerald-600 text-white rounded-2xl text-xs font-semibold transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
      >
        + Schedule a session
      </button>
    </div>
  );
}
