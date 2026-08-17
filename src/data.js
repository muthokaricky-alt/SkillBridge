// data.js — static UI-only constants.
//
// USERS, requests, sessions, and the profile used to live here as hardcoded
// arrays. They've moved to server/db.js and are now fetched over the network
// through src/api.js — see App.jsx's initial useEffect. Only things that
// never change at runtime (labels, colors, the signed-in user's display
// info) stay in this file.

export const ME = {
  name: "Rick Kyalo",
  unit: "Year 2",
  dept: "Computer Science",
  initials: "RK",
  color: "#8B6BF5",
};

// Categories shown as filter pills on Discover
// Each user's skills map to one of these
export const CATEGORIES = [
  "Technology", "Design", "Business", "Languages",
  "Music & Arts", "Fitness & Sports", "Academic Subjects", "Life Skills",
];

// Skill category filter pills shown above the Discover grid
export const SKILL_TAGS = [
  "AI & Automation", "Web Development", "Data Analysis", "UI/UX Design",
  "Digital Marketing", "Cybersecurity", "Cloud Computing", "Sales",
  "Public Speaking", "Content Creation",
];

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const AVATAR_COLORS = ["#8B6BF5", "#1FD4A0", "#F5B731", "#FF6B6B", "#56CCF2", "#E879F9", "#4ADE80", "#FB923C"];
