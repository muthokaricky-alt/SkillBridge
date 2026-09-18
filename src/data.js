// data.js — static UI-only constants.
//
// USERS, requests, sessions, and the profile used to live here as hardcoded
// arrays. They've moved to server/db.js and are now fetched over the network
// through src/api.js. The signed-in user's info (name, initials, estate,
// etc.) now comes from a real account via AuthContext instead of a
// hardcoded ME constant — see src/context/AuthContext.jsx.

// Categories shown as filter pills on Discover
// Each user's skills map to one of these
export const CATEGORIES = [
  "Technology", "Design", "Business", "Languages",
  "Music & Arts", "Fitness & Sports", "Academic Subjects", "Life Skills",
  "Agriculture",
];

// Skill category filter pills shown above the Discover grid
export const SKILL_TAGS = [
  "AI & Automation", "Web Development", "Data Analysis", "UI/UX Design",
  "Digital Marketing", "Cybersecurity", "Cloud Computing", "Sales",
  "Public Speaking", "Content Creation", "Agriculture",
];

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const AVATAR_COLORS = ["#8B6BF5", "#1FD4A0", "#F5B731", "#FF6B6B", "#56CCF2", "#E879F9", "#4ADE80", "#FB923C"];
