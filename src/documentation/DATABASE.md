# SkillBridge — SQLite Database

The API uses a real SQLite database stored in `skillbridge.db`, via `better-sqlite3`. It's a single local file — no separate database server to install or run.

## Setup

```bash
npm install
npm run server
```

The first server start automatically creates every table, seeds demo data, and generates default login credentials for every seeded user plus one admin account (see `README.md` for the default username/password).

Run the frontend separately:

```bash
npm run dev
```

## Reset demo data

Stop the server, then run:

```bash
npm run db:reset
npm run server
```

This deletes `skillbridge.db` (and its `-wal`/`-shm` sidecar files) so the next start recreates everything from scratch — including regenerating default credentials for every account.

## Migrations

`server/db.js` checks for missing columns/tables on every startup (via `PRAGMA table_info`) and adds them if needed — so an existing `skillbridge.db` from an earlier version of the project upgrades automatically without needing to be deleted. This is how `estate`/coordinates, skill `category`, and the entire auth system (`username`, `phone`, `password_hash`, `role`, `must_change_password`) were all added after the database already existed with real data in it.

## Database tables

- `users` — platform users (see below for the full column list)
- `skills` — unique skills, each with a `category` (Technology, Design, Agriculture, etc.)
- `user_skills` — skills each user offers/wants
- `requests` — skill exchange requests, coin requests, and AgroConnect consultation bookings
- `sessions` — booked learning sessions
- `profiles` — each user's Skill Coin balance
- `coin_history` — Skill Coin transaction log
- `auth_tokens` — active login sessions (one row per logged-in device/browser)
- `admin_audit_log` — every admin action (register/edit/delete/password-reset), for accountability

### `users` columns

| Column | Description |
| ------ | ------------ |
| `id` | Primary key |
| `name` | Full display name |
| `dept` | Department/category shown on their profile |
| `initials` | Auto-generated from `name` at signup (e.g. "Vini Jr" → "V.J") |
| `online` | Online status shown in the UI |
| `rating`, `reviews`, `swaps` | Aggregate trust metrics |
| `estate`, `lat`, `lng` | Location, used for AgroConnect's proximity search and the Maji logistics card |
| `username` | Unique login identifier |
| `phone` | Kenyan-format phone number (`07XXXXXXXX` or `01XXXXXXXX`) |
| `password_hash` | bcrypt hash — never sent to the frontend |
| `role` | `'user'` or `'admin'` |
| `must_change_password` | `1` if this account is still on a temporary/default password (set on every seeded account initially, and again whenever an admin resets someone's password directly) |

### `admin_audit_log` columns

| Column | Description |
| ------ | ------------ |
| `admin_id`, `admin_username` | Who performed the action (username stored redundantly so the log stays readable even if that admin account is later deleted) |
| `action` | `register_user`, `edit_user`, `reset_password`, or `delete_user` |
| `target_user_id`, `target_username` | Who the action was performed on (same redundant-storage reasoning — a log entry survives the target account being deleted) |
| `details` | Human-readable summary, e.g. "Changed: dept, estate" |
| `created_at` | Timestamp |

The existing React API calls remain compatible — every `server/db.js` function is `async`, so nothing above the database layer needs to know or care that it's SQLite rather than another engine.
