// server/server.js
//
// The SkillBridge API. Run it with `npm run server` (or `npm run server:dev`
// for auto-restart on save). It listens on port 3001 by default and the
// React app (running separately on port 5173 via `npm run dev`) talks to
// it over HTTP — see src/api.js on the frontend side.

import express from "express";
import cors from "cors";
import "dotenv/config";

import usersRouter from "./routes/users.routes.js";
import requestsRouter from "./routes/requests.routes.js";
import sessionsRouter from "./routes/sessions.routes.js";
import profileRouter from "./routes/profile.routes.js";
import expertsRouter from "./routes/experts.routes.js";
import skillsRouter from "./routes/skills.routes.js";
import logisticsRouter from "./routes/logistics.routes.js";
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: permissive by default (fine for local dev — the Vite dev server
// runs on a different port). Once deployed, set ALLOWED_ORIGIN in the
// environment to your actual frontend URL to stop other websites' JS
// from being able to call this API directly from a browser.
const allowedOrigin = process.env.ALLOWED_ORIGIN;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));
app.use(express.json());  // parse JSON request bodies into req.body

// simple endpoint to check the server is actually up
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/users", usersRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

// Downstream — served TO Farmers-AgroConnect
app.use("/api/experts", expertsRouter);
app.use("/api/skills", skillsRouter);

// Upstream — proxying calls TO Maji Website (see server/services/majiClient.js)
app.use("/api/logistics", logisticsRouter);

// catch-all for unmatched API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// global error handler — keeps a thrown error (bad JSON body, a DB
// constraint failure, an insufficient-coins guard, etc.) from crashing the
// process or leaking a raw stack trace to the client. Must be defined last,
// and needs all four args for Express to treat it as an error handler.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`SkillBridge API running at http://localhost:${PORT}`);
});
