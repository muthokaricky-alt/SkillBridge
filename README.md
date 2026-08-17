# SkillBridge

SkillBridge is a peer-to-peer skill exchange platform built for students. Instead of paying for tutoring or ads-driven marketplaces, students trade what they know for what they want to learn — either through a direct **skill swap** (you teach me UI/UX, I teach you web dev) or by spending **Skill Coins**, an in-app currency earned by teaching, completing sessions, and leaving reviews.

We separated each page we wanted among the 4 of us, then we did our parts separately to reduce merge conflicts, then we gave the full codebase to Rick, who pushed it to GitHub. We then refined the project later.

> **Note:** We started on an earlier repo but ran into an issue with it, so this repo is a fresh start from that point onward.

## What it does

- **Discover** — Browse other students, filter by skill category or search by name/department, and see a live compatibility score based on what you can teach and what you want to learn. Send a swap or coin-based exchange request straight from a match card.
- **My Profile** — Manage the skills you teach and the skills you want to learn, track your Skill Coins balance, and see your stats at a glance.
- **Requests** — Review incoming exchange requests, accept or decline them, and track requests you've sent and exchanges currently active.
- **Schedule** — Book sessions with matched students, browse a calendar of upcoming sessions, and rate a session once it's done.

All four pages are fully built and working end-to-end, backed by a real REST API instead of hardcoded data (see below).

## Tech stack

- **React 18** — component-based UI, all state managed with hooks (no external state library needed for an app this size)
- **Vite** — dev server and build tool
- **Tailwind CSS** — utility-first styling, no separate CSS files to hand-maintain per component
- **Express** — the backend API (see `server/`), serving users, requests, sessions, and profile data over REST
- **In-memory data store** — `server/db.js` acts as the "database" for now; every route talks to it through plain functions, so swapping in a real database later doesn't require touching the routes

## API

The frontend no longer hardcodes its data — it fetches everything from a small Express API on startup (`src/api.js`) and calls it again whenever something changes (adding a skill, sending a request, booking a session, etc.).

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/api/users` | List every student on the platform |
| GET | `/api/users/:id` | A single student |
| GET | `/api/requests` | All exchange requests |
| POST | `/api/requests` | Create a new request |
| PATCH | `/api/requests/:id` | Update a request's status (e.g. accept it) |
| DELETE | `/api/requests/:id` | Decline/remove a request |
| GET | `/api/sessions` | All booked sessions |
| POST | `/api/sessions` | Book a new session |
| PATCH | `/api/sessions/:id` | Mark a session as reviewed |
| GET | `/api/profile` | The signed-in user's offers, wants, coins, and coin history |
| POST | `/api/profile/skills` | Add a skill to "offers" or "wants" |
| DELETE | `/api/profile/skills/:type/:value` | Remove a skill |
| PATCH | `/api/profile/coins` | Earn or spend Skill Coins |

The API is in-memory, so restarting the server resets everything back to the seed data in `server/db.js` — expected behavior for a project without a real database yet.

## Fonts

- **Space Grotesk** (headings) — a geometric, slightly quirky display font. It gives SkillBridge a distinct, modern identity instead of looking like a generic template, while still reading clearly at large sizes.
- **Inter** (body) — designed specifically for screens, stays legible at small sizes (tags, timestamps, form labels), and has a wide weight range so we can distinguish hierarchy without switching fonts.

Both are loaded via Google Fonts in `index.html`.

## Running it

You need **two terminals** — one for the API, one for the frontend.

**Terminal 1 — the API:**
```bash
npm install
npm run server
```
This starts the backend at `http://localhost:3001`. Use `npm run server:dev` instead if you want it to auto-restart when you edit server files.

**Terminal 2 — the frontend:**
```bash
npm run dev
```
Then open the local URL Vite prints (usually `http://localhost:5173`). The app won't load any data until the API in Terminal 1 is running — if you see "Can't connect to the API," that's the fix.

If your API runs somewhere other than `localhost:3001`, copy `.env.example` to `.env` and change `VITE_API_URL`.

To build the frontend for production:

```bash
npm run build
npm run preview
```
(The backend doesn't need a build step — `npm run server` works the same in production.)

## Team

### Rick Kyalo
- Project lead
- Hardcoded data and shared utility functions (match scoring, avatar colors)
- Shared components (Avatar, SkillTag, Modal)
- HTML/CSS foundation and Tailwind setup
- Integration of all pages into the main app shell

### Jess
- Profile page: skill management (add/remove), Skill Coins display, profile stats
- General Ui suggestions

### Vinnie
- Requests page: incoming/sent/accepted request handling, accept/decline actions
- HTML/CSS Help

### Bill
- Schedule page: calendar view, session booking, session reviews

### Team Contributions
- Brainstorming features
- Design discussions
- General project review and testing



