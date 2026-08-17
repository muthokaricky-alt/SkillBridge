import { useState } from "react";
import { ME } from "../data.js";
import SkillTag from "../components/SkillTag.jsx";

export default function ProfilePage({ myOffers, myWants, myCoins, sessionsCount, coinHistory = [], onAddSkill, onRemoveSkill, nav }) {
  return (
    <div id="page-profile" className="page on max-w-5xl mx-auto px-6 py-10">
      <div className="mb-7">
        <h1 className="text-3xl font-semibold tracking-tight mb-2 font-display">
          My <em className="text-emerald-500 not-italic">Profile</em>
        </h1>
        <p className="text-sm text-[#666]">Your knowledge is your currency.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
        <div className="flex flex-col gap-4 sticky top-24 h-fit">
          <div className="card">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold mb-4"
              style={{ background: ME.color + "1A", color: ME.color }}
            >
              {ME.initials}
            </div>

            <div className="font-semibold text-lg mb-0.5 font-display">{ME.name}</div>
            <div className="text-sm text-[#666] mb-1">{ME.dept} · {ME.unit}</div>
            <div className="text-xs text-[#aaa] mb-5">Member since June 2026</div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                [myOffers.length + myWants.length, "Skills"],
                [sessionsCount, "Sessions"],
                ["4.8 ★", "Rating"],
              ].map(([num, label]) => (
                <div key={label} className="bg-[#FAFAFA] border border-[#EEE] rounded-2xl p-2.5 text-center">
                  <div className="font-semibold text-emerald-600 text-lg">{num}</div>
                  <div className="text-xs text-[#999] uppercase tracking-wide mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-2xl p-3.5 mb-3">
              <div>
                <div className="text-xs font-semibold text-amber-700">◈ Skill Coins</div>
                <div className="text-xs text-[#999]">For asymmetric exchanges</div>
              </div>
              <div className="text-2xl font-semibold text-amber-600">{myCoins}</div>
            </div>

            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-2xl px-3.5 py-2.5 mb-5">
              ⇄ Ujuzi wako ni currency yako
            </div>

            <button
              onClick={() => nav("discover")}
              className="w-full py-2.5 bg-[#111] hover:bg-emerald-600 text-white rounded-2xl text-xs font-semibold mb-2 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
            >
              Find matches →
            </button>
            <button
              onClick={() => nav("requests")}
              className="w-full py-2.5 border border-[#E5E5E5] hover:border-[#ccc] text-[#444] rounded-2xl text-xs font-semibold transition-all bg-white"
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
                <div className="text-center py-4 text-[#aaa] text-xs">No transactions yet</div>
              ) : (
                coinHistory.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs border-b border-[#F7F7F7] pb-2 last:border-b-0 last:pb-0">
                    <div className="min-w-0 pr-2">
                      <div className="font-medium text-[#333] truncate" title={item.action}>
                        {item.action}
                      </div>
                      <div className="text-[10px] text-[#aaa]">{item.date}</div>
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
        </div>
      </div>
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
        <span className="ml-auto text-xs text-[#aaa]">{skills.length} skill{skills.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {skills.length === 0
          ? <span className="text-xs text-[#aaa]">None added yet</span>
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
          className="flex-1 bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl px-3.5 py-2.5 text-sm text-[#111] outline-none focus:border-emerald-400 focus:bg-white placeholder-[#aaa]"
        />
        <button
          onClick={submit}
          className="px-4 py-2.5 bg-[#111] hover:bg-emerald-600 text-white rounded-2xl text-xs font-semibold transition-all"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

