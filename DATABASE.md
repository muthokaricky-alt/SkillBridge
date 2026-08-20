# SkillBridge — SQLite Database

The API now uses a real SQLite database stored in `skillbridge.db`.

## Setup

```bash
npm install
npm run server
```

The first server start automatically creates the database tables and inserts the demo data.

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

## Database tables

- `users` — platform users
- `skills` — unique skills
- `user_skills` — skills each user offers/wants
- `requests` — skill exchange requests
- `sessions` — booked learning sessions
- `profiles` — current user's Skill Coins
- `coin_history` — Skill Coin transactions

The existing React API calls remain compatible with the old in-memory implementation.
