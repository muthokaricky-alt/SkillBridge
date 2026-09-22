# SkillBridge

SkillBridge is a full-stack skill-exchange platform where students and learners can **offer skills, discover people to learn from, request skill swaps, book learning sessions, and manage Skill Coins**.

The project uses a React + Vite frontend and an Express REST API backed by a **real SQLite database**. The database replaces the earlier in-memory data approach, so changes persist when the API server restarts.

---

## ✨ Features

- 👤 Browse SkillBridge users and the skills they offer/want
- 🔎 Discover potential skill-exchange matches
- 🤝 Send, accept/update, and delete skill requests
- 📅 Create and review learning sessions
- 🪙 Manage Skill Coins and coin transaction history
- 🧩 Add or remove skills from a profile
- 💾 Persistent SQLite storage
- 🌱 Automatic demo-data seeding on first database creation
- 🔌 REST API consumed by the React frontend
- ⚡ Vite-powered frontend development

---

## 🛠️ Tech Stack

### Frontend

- **React 18** — UI
- **Vite** — development server and build tooling
- **Tailwind CSS** — styling
- **JavaScript (ES Modules)**

### Backend

- **Node.js** — runtime
- **Express 4** — REST API
- **CORS** — frontend/API communication
- **better-sqlite3** — SQLite database driver

### Database

- **SQLite** — lightweight relational database
- Database file: `skillbridge.db`

---

##  Project Architecture

```text
SkillBridge/
│
├── src/                         # React frontend
│   ├── App.jsx                  # Main application UI
│   ├── main.jsx                 # React entry point
│   ├── api.js                   # Frontend API client
│   ├── data.js                  # Frontend/static supporting data
│   ├── utils.js                 # Utility functions
│   └── index.css                # Global styles
│
├── server/                     # Express backend
│   ├── server.js                # API server entry point
│   ├── db.js                    # SQLite connection, schema, queries & seed data
│   ├── reset-db.js              # Deletes the local database for a clean reset
│   └── routes/
│       ├── users.routes.js      # User endpoints
│       ├── requests.routes.js  # Skill-request endpoints
│       ├── sessions.routes.js  # Learning-session endpoints
│       └── profile.routes.js   # Profile and Skill Coin endpoints
│
├── skillbridge.db              # SQLite database (created automatically)
├── DATABASE.md                 # Additional database notes
├── package.json                # Scripts and dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── index.html                  # Frontend HTML entry point
```

### Request flow

```text
React Component
      │
      ▼
src/api.js
      │
      │ HTTP / JSON
      ▼
Express REST API
      │
      ▼
server/routes/*.routes.js
      │
      ▼
server/db.js
      │
      ▼
SQLite (skillbridge.db)
```

The frontend does not access SQLite directly. All database operations go through the Express API.

---

##  Database

SkillBridge uses SQLite because it provides a real relational database without requiring a separate database server during development.

The database is stored at:

```text
skillbridge.db
```

On the first API startup, `server/db.js`:

1. Opens the SQLite database.
2. Enables foreign-key enforcement.
3. Enables SQLite WAL mode.
4. Creates the required tables if they do not exist.
5. Inserts the initial demo data if the database is empty.

### Database schema

```text
users
  │
  ├─────────────── profiles
  │
  └──────┐
         │
         ▼
   user_skills ◄──── skills

users ─────────────── requests

sessions

users ─────────────── coin_history
```

### Tables

| Table | Purpose |
|---|---|
| `users` | Stores SkillBridge users and basic profile statistics. |
| `skills` | Stores unique skill names. |
| `user_skills` | Many-to-many relationship between users and skills, including whether a skill is offered or wanted. |
| `requests` | Stores skill-swap and Skill Coin requests between users. |
| `sessions` | Stores scheduled learning sessions. |
| `profiles` | Stores the current user's Skill Coin balance. |
| `coin_history` | Records Skill Coin transactions. |

### Relationships

- One user can have many offered/wanted skills.
- One skill can belong to many users.
- A user can send and receive many requests.
- A user profile has one Skill Coin balance.
- A user can have many Skill Coin history records.
- Foreign keys are enabled with `ON DELETE CASCADE` or `ON DELETE SET NULL` where appropriate.

### Example: user skills

Instead of storing skills as a JavaScript array such as:

```js
[
  "Python",
  "Web Development",
  "AI & Automation"
]
```

the database represents them relationally:

```text
users
  id = 1
  name = Bill Amani

skills
  id = 3
  name = Python

user_skills
  user_id = 1
  skill_id = 3
  type = offer
```

This makes the data easier to query, update, and extend as the application grows.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd SkillBridge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the API server

```bash
npm run server
```

The API starts on:

```text
http://localhost:3001
```

The first startup creates `skillbridge.db` and seeds the demo data automatically.

### 4. Start the frontend

Open a second terminal in the project directory:

```bash
npm run dev
```

Vite normally serves the frontend at:

```text
http://localhost:5173
```

Open that address in your browser.

---

## 🔧 Environment Configuration

The frontend can use a custom API URL through `VITE_API_URL`.

Create a `.env` file if needed:

```env
VITE_API_URL=http://localhost:3001/api
```

If the variable is not provided, the frontend automatically uses:

```text
http://localhost:3001/api
```

An example environment file is included as `.env.example`.

---

## 📡 API Reference

Base URL:

```text
http://localhost:3001/api
```

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Checks whether the API is running. |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | Returns all users with their offered and wanted skills. |
| `GET` | `/users/:id` | Returns a single user. |

Example:

```bash
curl http://localhost:3001/api/users
```

### Requests

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/requests` | Returns skill requests. |
| `POST` | `/requests` | Creates a new request. |
| `PATCH` | `/requests/:id` | Updates a request status. |
| `DELETE` | `/requests/:id` | Deletes a request. |

Example request body:

```json
{
  "fromId": 2,
  "toId": 1,
  "offer": "UI/UX Design",
  "want": "Web Development",
  "type": "swap",
  "msg": "I can teach UI/UX in exchange for web development."
}
```

### Sessions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/sessions` | Returns scheduled sessions. |
| `POST` | `/sessions` | Creates a learning session. |
| `PATCH` | `/sessions/:id` | Marks a session as reviewed. |

Example request body:

```json
{
  "with": "Jessica",
  "skill": "UI/UX Design basics",
  "date": "2026-06-30",
  "time": "14:00",
  "dur": 60,
  "color": "#1FD4A0"
}
```

### Profile

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/profile` | Returns the current profile, skills, and Skill Coins. |
| `POST` | `/profile/skills` | Adds an offered or wanted skill. |
| `DELETE` | `/profile/skills/:type/:value` | Removes a profile skill. |
| `PATCH` | `/profile/coins` | Adjusts the Skill Coin balance. |

Example:

```json
{
  "type": "offer",
  "value": "React"
}
```

Adding an offered skill also awards one Skill Coin in the current implementation.

---

## 🧪 Development Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Starts the Vite frontend. |
| `npm run server` | Starts the Express API. |
| `npm run server:dev` | Starts the API with Nodemon auto-reload. |
| `npm run build` | Creates a production frontend build. |
| `npm run preview` | Previews the production frontend build. |
| `npm run db:reset` | Deletes the local SQLite database so it can be recreated with demo data. |

### Recommended development setup

Terminal 1:

```bash
npm run server:dev
```

Terminal 2:

```bash
npm run dev
```

---

## ♻️ Resetting the Database

If you want to return SkillBridge to its original demo state:

```bash
npm run db:reset
npm run server
```

`db:reset` removes:

```text
skillbridge.db
skillbridge.db-wal
skillbridge.db-shm
```

The next API startup recreates the schema and inserts the demo data.

> **Warning:** resetting the database permanently removes local database changes.

---

## 🔒 Data Persistence

The previous API implementation used in-memory JavaScript data. That meant changes could disappear whenever the Node.js process restarted.

The current implementation stores application data in SQLite instead:

```text
Before:
React → Express → JavaScript arrays

Current:
React → Express → SQLite
```

This means requests, sessions, profile changes, skills, and Skill Coin data can survive API restarts.

---

## 📦 Production Notes

This project currently uses SQLite for simplicity and portability. SQLite is a good fit for local development, demos, coursework, and small deployments.

For a larger multi-user production deployment, the database layer could later be migrated to PostgreSQL or another server-based relational database while keeping the same API architecture.

The frontend and backend are intentionally separated, making that future migration easier.

---

## 🎯 Project Goal

SkillBridge is designed around a simple idea:

> **Everyone knows something that someone else wants to learn.**

Instead of relying only on traditional courses, SkillBridge allows users to exchange knowledge directly through skill swaps, Skill Coins, and scheduled learning sessions.

---

##  License

This project is currently intended as an academic/personal portfolio project. Add the license of your choice before distributing it publicly.
=======
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



>>>>>>> 222be3cf76ee4a9544f389594999507f18fe9e2f
