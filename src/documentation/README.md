# SkillBridge

SkillBridge is a full-stack skill-exchange platform that allows users to discover people with complementary skills, exchange knowledge, schedule learning sessions, and manage skill-swap requests — behind real user accounts with login, signup, and an admin dashboard.

The project is built with React on the frontend and Node.js/Express on the backend, with SQLite providing persistent data storage. SkillBridge also participates in a three-team API ring: it **consumes** location and delivery data from **Maji Website** (upstream) and **provides** an expert-directory API to **Farmers-AgroConnect** (downstream).

## Features

* Real accounts: sign up with a username, phone number, and password; log in as a user or admin
* Every account starts on a shared default password and is forced to set a real one on first login
* Self-service password change (with your old password) and admin-driven password reset (without it)
* Admin dashboard: view every account in a table, register/edit/delete accounts, reset passwords
* Full admin audit log — every admin action recorded with who, what, to whom, and when
* User profiles with skills, departments, ratings, reviews, and availability
* Discover users based on skills they offer and skills they want to learn, including a dedicated **Agriculture** category
* Skill matching with a compatibility score
* Skill-swap requests, coin-based requests, and downstream AgroConnect consultation requests
* Request acceptance and rejection
* Learning session scheduling with a calendar view
* Skill Coins system with a server-enforced balance (can't go negative)
* Persistent database storage using SQLite, with automatic migrations
* Downstream API for Farmers-AgroConnect (expert directory, availability, reviews, categorized skills)
* Upstream integration with Maji Website (vendor stations, estates), with a mock-data fallback until real credentials are available
* Light/dark mode, mobile-responsive nav, and accessible (keyboard-navigable, ARIA-labeled) UI throughout

## Technology Stack

### Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* CSS custom properties (theming / dark mode)

### Backend

* Node.js
* Express.js
* REST API
* bcryptjs (password hashing)
* dotenv (environment configuration)

### Database

* SQLite
* Better-SQLite3

### Development Tools

* npm
* Git
* GitHub
* VS Code

## Project Architecture

```text
SkillBridge/
│
├── server/
│   ├── db.js
│   ├── server.js
│   ├── middleware/
│   │   └── auth.js               (requireAuth, requireAdmin)
│   ├── services/
│   │   └── majiClient.js
│   ├── utils/
│   │   └── asyncHandler.js
│   └── routes/
│       ├── auth.routes.js
│       ├── admin.routes.js
│       ├── profile.routes.js
│       ├── requests.routes.js
│       ├── sessions.routes.js
│       ├── users.routes.js
│       ├── experts.routes.js
│       ├── skills.routes.js
│       └── logistics.routes.js
│
├── src/
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── components/
│   │   ├── modals/
│   │   │   ├── ModalShell.jsx
│   │   │   ├── RequestModal.jsx
│   │   │   ├── ReviewModal.jsx
│   │   │   └── SessionModal.jsx
│   │   ├── Avatar.jsx
│   │   ├── MatchBar.jsx
│   │   ├── Nav.jsx
│   │   ├── SkillTag.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── Toast.jsx
│   │   └── LogisticsCard.jsx
│   │
│   ├── pages/
│   │   ├── AuthScreen.jsx
│   │   ├── ForcePasswordChangeScreen.jsx
│   │   ├── AdminPage.jsx
│   │   ├── DiscoverPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── RequestsPage.jsx
│   │   └── SchedulePage.jsx
│   │
│   ├── documentation/
│   │   ├── API_NEEDS.md
│   │   ├── API_NEEDS_UPSTREAM.md
│   │   ├── API_NEEDS_DOWNSTREAM.md
│   │   ├── ENDPOINT_LIST.md
│   │   ├── CONTRACT_QUESTIONS.md
│   │   ├── DATABASE.md
│   │   └── ...
│   │
│   ├── App.jsx
│   ├── api.js
│   ├── data.js
│   ├── index.css
│   ├── main.jsx
│   └── utils.js
│
├── index.html
├── package.json
├── openapi.yaml
└── README.md
```

## Application Architecture

```text
Farmers-AgroConnect                SkillBridge                 Maji Website
   (downstream)         <---   React Frontend   --->            (upstream)
                                     |
                                     | HTTP Requests (Bearer token once logged in)
                                     v
                              Express REST API
                            /       |          \
                requireAuth /  requireAdmin      \ Proxied upstream calls
                           |         |                        |
                           v         v                        v
                     SQLite Database (users, requests, ...)   server/services/majiClient.js
```

The React frontend handles UI, routing between pages, and holds the logged-in user's session (via `AuthContext`, backed by a token in `localStorage`).

The Express backend authenticates requests (`requireAuth`/`requireAdmin` middleware), applies business logic and validation, and talks to the database — plus serves the downstream API and proxies the upstream integration.

SQLite provides persistent storage for users, skills, requests, sessions, profiles, auth tokens, and the admin audit log.

## Authentication & Authorization

* **Signup** (`POST /api/auth/signup`) takes a full name, username, phone number (`07XXXXXXXX`/`01XXXXXXXX`), and password. Initials are auto-generated from the name (e.g. "Vini Jr" → "V.J").
* **Login** (`POST /api/auth/login`) is by **username** only.
* Sessions are simple opaque bearer tokens (`auth_tokens` table) rather than JWTs — easy to reason about and to revoke (logout just deletes the row).
* Every seeded demo account, plus one dedicated `admin` account, starts on the same default password and is flagged `must_change_password` — the frontend blocks entry into the app until it's changed.
* Self-service change (`PATCH /api/auth/password`) requires the current password. Admin's reset (`PATCH /api/admin/users/:id/password`) doesn't — and re-flags `must_change_password` so the user has to pick their own on next login.
* `requireAuth` middleware reads the `Authorization: Bearer <token>` header and attaches `req.user`. `requireAdmin` (used after `requireAuth`) checks `req.user.role === 'admin'`.

**Known scope limitation:** requests and sessions aren't yet scoped per-user — every logged-in account currently sees the same shared list, though a request's `fromId` is correctly derived from the authenticated user rather than trusted from the client. Full per-user filtering would be a reasonable next step.

## Database

SkillBridge uses SQLite instead of storing application data in JavaScript arrays.

The database is created, seeded, and automatically migrated by `server/db.js`. Migrations run on every server startup and are idempotent — they check for a column or table before adding it — so an existing `skillbridge.db` upgrades safely without needing to be deleted and reseeded. This is how the entire auth system was added to a database that already had real seeded data in it.

### Database Structure

```text
users
skills
user_skills
profiles
requests
sessions
coin_history
auth_tokens
admin_audit_log
```

See `src/documentation/DATABASE.md` for the full column-by-column reference, including every `users` column added for auth (`username`, `phone`, `password_hash`, `role`, `must_change_password`) and the `admin_audit_log` schema.

## REST API

### Auth

```text
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
PATCH /api/auth/password
```

### Admin (admin role required)

```text
GET    /api/admin/users
POST   /api/admin/users
PATCH  /api/admin/users/:id
PATCH  /api/admin/users/:id/password
DELETE /api/admin/users/:id
GET    /api/admin/audit-log
```

### Users

```text
GET /api/users
GET /api/users/:id
```

### Profile (login required)

```text
GET  /api/profile
POST /api/profile/skills
DELETE /api/profile/skills/:type/:value
PATCH /api/profile/coins
```

### Requests (login required, except the AgroConnect consultation shape)

```text
GET  /api/requests
POST /api/requests
PATCH /api/requests/:id
DELETE /api/requests/:id
```

`POST /api/requests` branches on shape: a body with `expertId` is treated as an AgroConnect consultation booking (no login required — AgroConnect has no SkillBridge account); anything else is a SkillBridge swap/coin request, which does require login, with `fromId` taken from the verified token rather than the request body.

### Sessions (login required)

```text
GET  /api/sessions
POST /api/sessions
PATCH /api/sessions/:id
```

### Downstream API — provided to Farmers-AgroConnect

```text
GET  /api/experts?estate={estate}&sort={rating|proximity}&lat=&lng=
GET  /api/experts/:id
GET  /api/experts/:id/availability
GET  /api/experts/:id/reviews
GET  /api/skills?tag={category}
```

`?tag=` filters by SkillBridge's own category taxonomy (Technology, Design, Business, Languages, Music & Arts, Fitness & Sports, Academic Subjects, Life Skills, **Agriculture**).

### Upstream integration — consumed from Maji Website

```text
GET  /api/logistics/stations?estate={estate}
GET  /api/logistics/estates
```

Proxied through our backend via `server/services/majiClient.js` rather than exposed to the frontend directly. Until `MAJI_API_BASE_URL` is configured, these return schema-accurate **mock data**, flagged with `"source": "mock"` in every response. See `CONTRACT_QUESTIONS.md` for what turned out to differ between the original assumed contract and Maji's real one — notably, there is no delivery-tracking or per-estate payment-methods capability in their real API, so those endpoints were removed rather than left pointing at something that doesn't exist.

## Installation

```bash
git clone https://github.com/muthokaricky-alt/SkillBridge-webapp.git
cd SkillBridge-webapp
npm install
```

## Running the Application

Backend:

```bash
npm run server
```

Frontend (separate terminal):

```bash
npm run dev
```

Open `http://localhost:5173`. To test on a phone over the same Wi-Fi network, run `npm run dev -- --host` and set `VITE_API_URL` in `.env` to your computer's local network IP.

## Logging In

Every account is forced to change its password on first login.

| Account | Username | Default password |
| ------- | -------- | ------------------ |
| Admin | `admin` | `1234` |
| Any seeded student | auto-generated from their name (e.g. `billamani`) | `1234` |

Or sign up as a new user from the login screen.

## Database Setup

The SQLite database initializes and migrates automatically when the backend starts. The file (`skillbridge.db`) is gitignored — each developer gets a freshly-seeded copy on first run.

Reset to the initial demo state:

```bash
npm run db:reset
npm run server
```

## Environment Variables

Optional — a `.env` file (gitignored) can override defaults from `.env.example`:

```bash
VITE_API_URL=http://localhost:3001/api

# Upstream: Maji Website integration (optional — falls back to mock data)
# MAJI_API_BASE_URL=https://<their-real-host>/api
# MAJI_API_KEY=<the key/token they issue you>
```

No database configuration is needed — SQLite requires none.

## Available Commands

```bash
npm install              # install dependencies
npm run dev               # frontend dev server
npm run dev -- --host      # frontend, reachable from other devices
npm run server             # backend
npm run server:dev         # backend with auto-restart
npm run db:reset            # reset the database
npm run build                # production frontend build
npm run preview               # preview production build
```

## Development Notes

Frontend code lives in `src/`, backend code in `server/`. Database logic is centralized in `server/db.js`; route logic is split per-resource under `server/routes/`; auth middleware lives in `server/middleware/auth.js`; the Maji Website adapter lives in `server/services/majiClient.js`.

Every `db.js` function is declared `async`, even the ones that only do synchronous SQLite work internally — this keeps every route's `await db.fn()` calls valid regardless of what database engine sits underneath, and is why the project could move between SQLite and another engine during development without touching a single route file.

## Future Improvements

* Real (non-mock) integration with Maji Website once their live API is available
* Per-user scoping for requests and sessions (currently shared across all logged-in accounts)
* Session token expiry
* Dedicated `farmer_name`/`date` columns on consultation requests, rather than folding them into the message text
* Per-student configurable availability, rather than the fixed daily slot template
* Real-time notifications (WebSockets)
* Automated testing
* PostgreSQL migration for a production deployment
* Deployment using a cloud hosting platform

## Project Purpose

SkillBridge was developed as a full-stack application demonstrating a modern React frontend, RESTful backend services, relational database persistence, real authentication and role-based access control, and multi-team REST API integration (both as a provider and a consumer).

Concepts demonstrated include:

* Component-based frontend development
* REST API design (resources, verbs, query parameters, status codes)
* Authentication (password hashing, token-based sessions) and authorization (role-based route guards)
* CRUD operations
* Relational database design and self-migrating schemas
* State management
* Form handling and modal-based interactions
* Backend routing and input validation
* Consuming a partner's API with a mock-data fallback strategy
* Accessibility and responsive design

## License

This project is intended for educational and portfolio purposes.
