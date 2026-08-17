// server/db.js
//
// A plain in-memory "database" for the SkillBridge API.
// Everything lives in arrays/objects in this file instead of a real
// database (Postgres, MongoDB, etc.) — swap it out later without any
// route file needing to change, since routes only ever call the
// functions exported here, never touch the arrays directly.
//
// NOTE: because this is in-memory, all data resets when the server
// restarts. That's expected for a teaching project.

export const users = [
  { id: 1, name: "Bill Amani", dept: "Technology", initials: "BA", online: true, rating: 4.9, reviews: 23, swaps: 12, offers: ["AI & Automation", "Web Development", "Python"], wants: ["UI/UX Design", "Public Speaking", "Sales"] },
  { id: 2, name: "Jessica", dept: "Design", initials: "J", online: true, rating: 4.8, reviews: 17, swaps: 8, offers: ["UI/UX Design", "Figma", "Content Creation"], wants: ["Web Development", "Data Analysis", "Digital Marketing"] },
  { id: 3, name: "William Kasongo", dept: "Business", initials: "WK", online: false, rating: 5.0, reviews: 31, swaps: 15, offers: ["Sales", "Taxes", "Digital Marketing"], wants: ["Web Development", "Cybersecurity", "Public Speaking"] },
  { id: 4, name: "K.Dot", dept: "Music & Arts", initials: "KD", online: true, rating: 4.7, reviews: 12, swaps: 6, offers: ["Music Production", "Songwriting", "Content Creation"], wants: ["Digital Marketing", "Sales", "AI & Automation"] },
  { id: 5, name: "La Pulga", dept: "Fitness & Sports", initials: "LP", online: false, rating: 4.9, reviews: 40, swaps: 20, offers: ["Football Coaching", "Fitness Training"], wants: ["Sales", "Digital Marketing", "Public Speaking"] },
  { id: 6, name: "Walter White", dept: "Academic Subjects", initials: "WW", online: true, rating: 4.6, reviews: 19, swaps: 9, offers: ["Chemistry", "Academic Tutoring"], wants: ["UI/UX Design", "Public Speaking", "Sales"] },
  { id: 7, name: "Bruce Wayne", dept: "Business", initials: "BW", online: false, rating: 4.8, reviews: 22, swaps: 11, offers: ["Cybersecurity", "Cloud Computing", "Sales"], wants: ["Public Speaking", "Content Creation", "AI & Automation"] },
  { id: 8, name: "Lelouch", dept: "Life Skills", initials: "L", online: true, rating: 4.5, reviews: 8, swaps: 4, offers: ["Public Speaking", "Strategy & Planning"], wants: ["Web Development", "Cybersecurity", "Digital Marketing"] },
  { id: 9, name: "Naruto Uzumaki", dept: "Fitness & Sports", initials: "NU", online: true, rating: 4.7, reviews: 14, swaps: 7, offers: ["Fitness Training", "Public Speaking"], wants: ["AI & Automation", "Cloud Computing", "Sales"] },
  { id: 10, name: "Ichigoat", dept: "Fitness & Sports", initials: "IG", online: false, rating: 4.9, reviews: 26, swaps: 13, offers: ["Karate", "Fitness Training"], wants: ["Web Development", "Digital Marketing", "Music Production"] },
  { id: 11, name: "Jordan Lee", dept: "Languages", initials: "JL", online: true, rating: 4.8, reviews: 17, swaps: 8, offers: ["Spanish", "French", "Translation"], wants: ["Web Development", "Data Analysis", "Cybersecurity"] },
  { id: 12, name: "Priya Sharma", dept: "Academic Subjects", initials: "PS", online: false, rating: 5.0, reviews: 31, swaps: 15, offers: ["Data Analysis", "Statistics", "Academic Tutoring"], wants: ["Web Development", "Cybersecurity", "UI/UX Design"] },
];

// "swap" = skill for skill | "coin" = spent Skill Coins
export const requests = [
  { id: 1, fromId: 2, offer: "UI/UX Design", want: "Web Development", type: "swap", msg: "Hey! I want to learn web dev. I could teach you UI/UX in return!", time: "10m ago", status: "incoming" },
  { id: 2, fromId: 4, offer: "Music Production", want: "AI & Automation", type: "swap", msg: "I want to learn AI & Automation for my next project. Happy to teach music production!", time: "2h ago", status: "incoming" },
  { id: 3, fromId: 11, toId: 11, offer: null, want: "Data Analysis", type: "coin", msg: "I used 3 Skill Coins for this. I really need Data Analysis skills!", time: "1d ago", status: "sent" },
];

export const sessions = [
  { id: 1, with: "Jessica", skill: "UI/UX Design basics", date: "2026-06-26", time: "14:00", dur: 60, color: "#1FD4A0", reviewed: false },
  { id: 2, with: "K.Dot", skill: "Music Production intro", date: "2026-06-28", time: "10:30", dur: 45, color: "#F5B731", reviewed: false },
  { id: 3, with: "Jordan Lee", skill: "Spanish for beginners", date: "2026-06-30", time: "16:00", dur: 60, color: "#8B6BF5", reviewed: false },
];

// The signed-in user's own profile — offers/wants/coins/history.
// Single-user app for now, so this is just one object rather than a table.
export const profile = {
  offers: ["Python", "Flask", "Git"],
  wants: ["UI Design", "Spanish", "Piano"],
  coins: 12,
  coinHistory: [
    { id: 1, action: "Joined SkillBridge", change: 10, date: "1 month ago" },
    { id: 2, action: "Completed swap with Jordan Lee", change: 2, date: "10h ago" },
  ],
};

let nextRequestId = 100;
let nextSessionId = 100;
let nextHistoryId = 100;

export function getNextRequestId() { return nextRequestId++; }
export function getNextSessionId() { return nextSessionId++; }
export function getNextHistoryId() { return nextHistoryId++; }

/* ---------- mutators ----------
   Route files call these instead of touching the arrays/objects
   above directly — keeps all the "how do I change the data" logic
   in one place. */

export function addRequest(newRequest) {
  requests.push(newRequest);
  return newRequest;
}

export function updateRequestStatus(id, status) {
  const found = requests.find((r) => r.id === id);
  if (found) found.status = status;
  return found;
}

export function removeRequest(id) {
  const index = requests.findIndex((r) => r.id === id);
  if (index !== -1) requests.splice(index, 1);
}

export function addSession(newSession) {
  sessions.push(newSession);
  return newSession;
}

export function markSessionReviewed(id) {
  const found = sessions.find((s) => s.id === id);
  if (found) found.reviewed = true;
  return found;
}

export function addProfileSkill(type, value) {
  const key = type === "offer" ? "offers" : "wants";
  profile[key].push(value);
  return profile;
}

export function removeProfileSkill(type, value) {
  const key = type === "offer" ? "offers" : "wants";
  profile[key] = profile[key].filter((s) => s !== value);
  return profile;
}

export function adjustCoins(delta, reason) {
  profile.coins += delta;
  profile.coinHistory.unshift({
    id: getNextHistoryId(),
    action: reason || (delta > 0 ? "Coins earned" : "Coins spent"),
    change: delta,
    date: "Just now",
  });
  return profile;
}
