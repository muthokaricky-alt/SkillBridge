# SkillBridge — Project Walkthrough

A file-by-file map of the codebase (~4,150 lines across backend + frontend) and how the pieces actually talk to each other. This complements `README.md` (feature overview) and `DATABASE.md` (schema reference) — this doc answers "what does *this specific file* do, and who calls it?"

---

## 1. The Big Picture

```text
Browser (React app)
   |
   | fetch() calls, via src/api.js
   | Authorization: Bearer <token> header once logged in
   v
Express server (server/server.js)
   |
   | routes check auth, validate input, call db.js functions
   v
server/db.js  <-- talks to skillbridge.db (SQLite file)
   |
   | also proxies certain calls to...
   v
server/services/majiClient.js  <-- Maji Website (mock or real, upstream partner)
```

Two other teams sit at the edges of this diagram, both talking to your Express server over plain HTTP, not through the React app:

- **Farmers-AgroConnect** calls your `/api/experts`, `/api/skills`, and the consultation-booking shape of `/api/requests` directly — they never see your frontend.
- **Maji Website** is who `majiClient.js` calls *out to* — SkillBridge is the consumer here, not the provider.

---

## 2. Backend (`server/`)

### `server/server.js`
The entry point. Creates the Express app, turns on `cors()` and `express.json()`, defines `/api/health`, mounts every route file under its path prefix (`/api/users`, `/api/auth`, `/api/admin`, etc.), and has the catch-all 404 handler plus the global error handler at the very end. Running `npm run server` runs this file.

### `server/db.js`
The only file that touches SQLite directly. Everything else in the backend calls functions exported from here rather than writing SQL itself. Responsibilities, in the order they happen at startup:

1. **Schema creation** — `CREATE TABLE IF NOT EXISTS` for every table (`users`, `skills`, `user_skills`, `requests`, `sessions`, `profiles`, `coin_history`, `auth_tokens`, `admin_audit_log`).
2. **Migrations** — checks `PRAGMA table_info` for columns that might not exist yet (e.g. `estate`, `username`, `must_change_password`) and adds them. This is what let the auth system get added to a database that already had real seeded data in it, without anyone needing to delete `skillbridge.db` first.
3. **Seeding** — inserts the 14 demo students (including the two Agriculture-category ones, Amina Farah and Samuel Mwangi) and their skills, but only if the `users` table is empty.
4. **Auth credential backfill** — gives every user a `username`/`phone`/password-hash for `"1234"` and flags `must_change_password = 1`, and creates the dedicated `admin` account if one doesn't exist yet.

After startup, it exports functions grouped by what they're for:
- **Core reads**: `getUsers`, `getUserById`
- **Downstream (AgroConnect)**: `getExperts`, `getExpertById`, `getExpertAvailability`, `getExpertReviews`, `getSkillsByCategory`
- **Requests/sessions/profile**: `getRequests`, `addRequest`, `addConsultationRequest`, `updateRequestStatus`, `removeRequest`, `getSessions`, `addSession`, `markSessionReviewed`, `getProfile`, `addProfileSkill`, `removeProfileSkill`, `adjustCoins`
- **Auth**: `findUserByUsername`, `createUser`, `createAuthToken`, `getUserByToken`, `deleteAuthToken`, `changePassword`, `adminSetPassword`, `verifyPassword`
- **Admin**: `adminGetAllUsers`, `adminUpdateUser`, `adminDeleteUser`, `logAdminAction`, `getAdminAuditLog`

Every one of these is declared `async`, even though better-sqlite3 itself is synchronous — that's deliberate, so every route file's `await db.someFunction()` calls stay valid no matter what's actually happening underneath (this is also why swapping to MySQL and back during development didn't require touching a single route file).

### `server/middleware/auth.js`
Two small functions used as Express middleware:
- **`requireAuth`** — reads the `Authorization: Bearer <token>` header, looks it up via `db.js`'s `getUserByToken`, and attaches the result as `req.user`. Responds `401` if there's no valid token.
- **`requireAdmin`** — must run *after* `requireAuth`. Checks `req.user.role === "admin"`, responds `403` otherwise.

### `server/utils/asyncHandler.js`
A one-function file: wraps an async route handler so that if it throws or its promise rejects, the error gets forwarded to Express's error-handling middleware via `next(err)` instead of crashing the process or hanging the request. Every route in `users.routes.js`, `profile.routes.js`, `sessions.routes.js`, `experts.routes.js`, and `skills.routes.js` is wrapped in this.

### `server/services/majiClient.js`
The only file that knows how to talk to Maji Website. Exports `getStations`, `getEstates`, `getCustomerPaymentMethod`, `registerDriverInterest`, and two deliberately-broken stubs (`getDelivery`, `createDelivery`) that throw a clear "not supported" error, because Maji's real API turned out not to have delivery-tracking at all (see `CONTRACT_QUESTIONS.md`). Every function checks whether `MAJI_API_BASE_URL` is set in the environment — if not, it returns mock data shaped exactly like the real contract, tagged `"source": "mock"`.

### `server/routes/*.js` — one file per resource
Each file defines a small Express `Router` and is mounted onto a path prefix in `server.js`. None of them contain SQL — they validate input, call `db.js` functions, and shape the HTTP response.

| File | Mounted at | Requires login? | What it does |
|---|---|---|---|
| `auth.routes.js` | `/api/auth` | Mixed | Signup, login, logout, `/me`, self-service password change |
| `admin.routes.js` | `/api/admin` | Yes, admin only (`router.use(requireAuth, requireAdmin)`) | List/register/edit/delete users, reset passwords, audit log |
| `profile.routes.js` | `/api/profile` | Yes (`router.use(requireAuth)`) | Your own skills and Skill Coin balance |
| `requests.routes.js` | `/api/requests` | Mostly — except the AgroConnect consultation shape | Swap/coin requests between students, plus AgroConnect bookings |
| `sessions.routes.js` | `/api/sessions` | Yes | Scheduling learning sessions |
| `users.routes.js` | `/api/users` | No | Basic user list/lookup |
| `experts.routes.js` | `/api/experts` | No | The AgroConnect-facing "expert directory" view of the same users |
| `skills.routes.js` | `/api/skills` | No | Categorized skill catalogue, filterable by `?tag=` |
| `logistics.routes.js` | `/api/logistics` | No | Frontend-facing proxy in front of `majiClient.js` |

**Worth noting**: `requests.routes.js` is the one route file that can't use a single `router.use(requireAuth)` line, because its `POST /` has to serve two different callers — a logged-in SkillBridge student (needs auth) and Farmers-AgroConnect submitting a consultation booking (must stay open, since they have no SkillBridge account). It branches on whether `req.body.expertId` is present before deciding which path to take.

---

## 3. Frontend (`src/`)

### `src/main.jsx`
The actual entry point React mounts. Wraps `<App />` in `<AuthProvider>` so every component below it can call `useAuth()`.

### `src/context/AuthContext.jsx`
Holds the logged-in user's state app-wide: `user`, `checkingSession` (true while validating a saved token on page load), `login`, `signup`, `logout`, and `updateUser` (for reflecting an admin's edit to your own account immediately). Persists the auth token to `localStorage` so refreshing the page doesn't log you out.

### `src/api.js`
Every network call the frontend makes goes through here — no component calls `fetch` directly. Holds the current auth token in memory (`setAuthToken`) and attaches it as a Bearer header automatically. One function per backend endpoint (`api.login(...)`, `api.getProfile()`, `api.adminDeleteUser(id)`, etc.).

### `src/App.jsx`
The top-level component and the only place that decides *which screen* the user sees, in this order:
1. `checkingSession` → a tiny loading spinner
2. no `user` → `<AuthScreen />` (login/signup)
3. `user.mustChangePassword` → `<ForcePasswordChangeScreen />`, blocking everything else
4. otherwise → the real app: `<Nav>` plus whichever page matches the current tab (`discover`, `profile`, `requests`, `schedule`, or `admin` if the role allows it)

It also owns most of the cross-page state (the loaded users/requests/sessions lists, the "already sent" tracking, modal open/close state) and the functions that mutate it (`sendRequest`, `acceptReq`, `addSkill`, etc.), which it passes down as props.

### `src/data.js`
Pure constants only — no user data lives here anymore (it used to, before the backend existed). Just `CATEGORIES`, `SKILL_TAGS`, `MONTH_NAMES`, `WEEK_DAYS`.

### `src/utils.js`
Small pure helper functions: `calcMatch` (skill compatibility scoring for Discover), `getAvatarColor` (deterministic color per name), `formatDate`.

### `src/index.css`
Tailwind entry point plus the CSS custom-property theme system (`--sb-bg`, `--sb-text-primary`, etc., defined under `:root` and overridden under `html.dark`) that makes dark mode work by flipping one class on `<html>` rather than touching every component.

### `src/pages/` — one file per full-page view
| File | Shown when | Talks to |
|---|---|---|
| `AuthScreen.jsx` | Not logged in | `useAuth()` → `login`/`signup` |
| `ForcePasswordChangeScreen.jsx` | `user.mustChangePassword` is true | `api.changePassword`, then `useAuth().updateUser` |
| `DiscoverPage.jsx` | "Discover" tab | Receives the pre-loaded user list + match scores as props from `App.jsx` |
| `ProfilePage.jsx` | "My Profile" tab | Receives `user` from `App.jsx`; has its own `ChangePasswordCard` calling `api.changePassword` directly |
| `RequestsPage.jsx` | "Requests" tab | Receives `requests`/`users`/`currentUserId` as props |
| `SchedulePage.jsx` | "Schedule" tab | Renders the calendar plus `<LogisticsCard estate={user.estate} />` |
| `AdminPage.jsx` | "Admin" tab (admin role only) | Calls `api.adminGetUsers`, `adminCreateUser`, `adminUpdateUser`, `adminSetPassword`, `adminDeleteUser`, `adminGetAuditLog` directly — it's mostly self-contained rather than driven by `App.jsx` state |

### `src/components/` — reusable pieces
- **`Nav.jsx`** — top bar; shows the tab list (plus "Admin" if `user.role === "admin"`), search box, coin balance, dark-mode toggle, avatar, and logout button. Collapses into a hamburger menu below the `md` breakpoint.
- **`ThemeToggle.jsx`** — the sun/moon button, plus the `useTheme()` hook that reads/writes `localStorage` and toggles the `dark` class on `<html>`.
- **`LogisticsCard.jsx`** — the "nearby water stations" card on Schedule; calls `api.getStations(estate)`, which hits the backend proxy in front of `majiClient.js`.
- **`Avatar.jsx`, `MatchBar.jsx`, `SkillTag.jsx`, `Toast.jsx`** — small presentational pieces used across multiple pages.
- **`modals/ModalShell.jsx`** — the shared dialog wrapper (backdrop, close button, animation) that `RequestModal.jsx`, `SessionModal.jsx`, and `ReviewModal.jsx` all build on, plus the "Add/Edit user" and "Reset password" modals in `AdminPage.jsx`.

---

## 4. Tracing a Few Requests End-to-End

**Logging in:**
`AuthScreen.jsx` (login form) → `useAuth().login(username, password)` → `api.login(...)` → `POST /api/auth/login` → `auth.routes.js` finds the user via `db.js`'s `findUserByUsername`, checks the password with `verifyPassword`, issues a token via `createAuthToken` → the token comes back to `AuthContext`, gets saved to `localStorage` and held in `api.js`'s in-memory `authToken` → `App.jsx` re-renders now that `user` is set.

**Viewing Discover:**
`App.jsx`'s startup effect calls `api.getUsers()`, `api.getRequests()`, `api.getSessions()`, `api.getProfile()` in parallel → each hits its respective route file → each route calls the matching `db.js` function → `App.jsx` computes match scores via `calcMatch` (from `utils.js`) and passes the sorted list to `DiscoverPage.jsx`.

**Admin resetting a password:**
`AdminPage.jsx`'s "Reset password" button → `api.adminSetPassword(id, newPassword)` → `PATCH /api/admin/users/:id/password` → `admin.routes.js` (behind `requireAuth` + `requireAdmin`) calls `db.js`'s `adminSetPassword` (hashes it, sets `must_change_password = 1`) → then calls `logAdminAction` to write a row into `admin_audit_log` → both the users table and the audit log refresh in `AdminPage.jsx`'s state.

**AgroConnect booking a consultation** (no SkillBridge login involved at all):
Their server sends `POST /api/requests` with `{ farmerName, topic, expertId, date }` → `requests.routes.js` sees `expertId` in the body and routes to `consultationHandler` (defined in `experts.routes.js`) *before* any auth check happens → that calls `db.js`'s `addConsultationRequest`, which folds the details into a `requests` row with `type: "consult"`.

---

## 5. Known Gaps (documented on purpose, not accidentally missed)

- **Requests and sessions aren't scoped per logged-in user** — every account currently sees the same shared list. `fromId` on a new request is correctly derived from the auth token (not spoofable from the client), but the *viewing* side doesn't yet filter by "is this mine?"
- **Auth tokens don't expire.**
- **No rate limiting on `/api/auth/login`.**
- ~~`server/schema.sql` and `server/seed.sql` are unused leftovers~~ — removed. They described a different, stale schema (table names like `exchange_requests`/`coin_transactions` that never matched the real implementation in `server/db.js`).
