// utils.js — shared helpers (pure functions, no state)

import { AVATAR_COLORS } from "./data.js";

// Same name always gives the same colour (like Slack/GitHub avatars)
export function getAvatarColor(name) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Bidirectional match: do they teach what I want, and do I teach what they want?
export function calcMatch(user, myOffers, myWants) {
  const lower = (s) => s.toLowerCase();
  const theyTeachMe = user.offers.filter((s) =>
    myWants.some((w) => lower(s).includes(lower(w)) || lower(w).includes(lower(s)))
  ).length;
  const iTeachThem = user.wants.filter((s) =>
    myOffers.some((o) => lower(s).includes(lower(o)) || lower(o).includes(lower(s)))
  ).length;
  const total = Math.max(1, myOffers.length + myWants.length);
  return Math.min(97, Math.round(((theyTeachMe + iTeachThem) / total) * 120)); // capped so it never feels like a guaranteed 100%
}

export function formatDate(date) {
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}
