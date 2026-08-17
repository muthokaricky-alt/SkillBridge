// server/server.js
//
// The SkillBridge API. Run it with `npm run server` (or `npm run server:dev`
// for auto-restart on save). It listens on port 3001 by default and the
// React app (running separately on port 5173 via `npm run dev`) talks to
// it over HTTP — see src/api.js on the frontend side.

import express from "express";
import cors from "cors";

import usersRouter from "./routes/users.routes.js";
import requestsRouter from "./routes/requests.routes.js";
import sessionsRouter from "./routes/sessions.routes.js";
import profileRouter from "./routes/profile.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());          // allow the Vite dev server (different port) to call this API
app.use(express.json());  // parse JSON request bodies into req.body

// simple endpoint to check the server is actually up
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/users", usersRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/profile", profileRouter);

// catch-all for unmatched API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`SkillBridge API running at http://localhost:${PORT}`);
});
