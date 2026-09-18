import { useEffect, useState } from "react";
import { api } from "../api.js";

// Shown on the Schedule page for anyone planning a physical (in-person)
// study session — surfaces nearby water vendor stations for the
// signed-in student's estate. This is SkillBridge consuming Maji
// Website's upstream API (see API_NEEDS_UPSTREAM.md); when
// MAJI_API_BASE_URL isn't configured yet, the backend returns mock data
// and this card shows a small "Preview data" badge so it's clear it's
// not live.
//
// Updated after receiving Maji's real openapi.yaml: their /vendors/stations
// endpoint only returns stationName/vendorId/targetEstateId — no hours or
// stock-level fields, and no per-estate payment-methods endpoint exists at
// all (see server/services/majiClient.js and CONTRACT_QUESTIONS.md for the
// full list of what changed from the original assumption).
export default function LogisticsCard({ estate }) {
  const [stations, setStations] = useState(null);
  const [source, setSource] = useState("mock");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.getStations(estate)
      .then((res) => {
        if (cancelled) return;
        setStations(res.stations);
        setSource(res.source);
      })
      .catch((err) => !cancelled && setError(err.message));
    return () => { cancelled = true; };
  }, [estate]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold text-sm font-display">Nearby water stations</div>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            source === "live"
              ? "text-emerald-700 bg-emerald-50 border-emerald-100"
              : "text-[var(--sb-text-tertiary)] bg-[var(--sb-surface-alt)] border-[var(--sb-border)]"
          }`}
        >
          {source === "live" ? "Live · Maji Website" : "Preview data"}
        </span>
      </div>
      <p className="text-xs text-[var(--sb-text-tertiary)] mb-4">
        {estate ? `For groups meeting in person near ${estate}.` : "Set your estate in your profile to see nearby stations."}
      </p>

      {error && <div className="text-xs text-red-600">Couldn't reach logistics: {error}</div>}

      {!error && !stations && (
        <div className="flex flex-col gap-2" aria-hidden="true">
          {[0, 1].map((i) => <div key={i} className="h-10 rounded-xl bg-[var(--sb-surface-alt)] animate-pulse" />)}
        </div>
      )}

      {stations && stations.length === 0 && (
        <div className="text-xs text-[var(--sb-text-tertiary)] py-2">No vendor stations found near {estate} yet.</div>
      )}

      {stations && stations.length > 0 && (
        <div className="flex flex-col gap-2">
          {stations.map((s) => (
            <div key={s.vendorId} className="flex items-center border border-[var(--sb-border-subtle)] rounded-xl px-3 py-2.5">
              <div className="text-xs font-semibold text-[var(--sb-text-primary)] truncate">{s.stationName}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
