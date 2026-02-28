import * as Sentry from "@sentry/node"
import { nodeProfilingIntegration } from "@sentry/profiling-node"
import "dotenv/config"
import { env } from "./env.js"

Sentry.init({
    dsn: env.SENTRY_DSN,
    integrations: [
        nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
})

import express, { type Express } from "express"
import cors from "cors"
import { createServer, type Server as HttpServer } from "http"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { toNodeHandler } from "better-auth/node"
import { auth } from "./auth/index.js"
import { setupSocketIO } from "./socket/index.js"
import { errorHandler } from "./middleware/error.js"

// Route imports
import workspacesRouter from "./routes/workspaces.js"
import boardsRouter from "./routes/boards.js"
import columnsRouter from "./routes/columns.js"
import tasksRouter from "./routes/tasks.js"
import commentsRouter from "./routes/comments.js"
import activityRouter from "./routes/activity.js"
import usersRouter from "./routes/users.js"
import notificationsRouter from "./routes/notifications.js"

export const app: Express = express()
export const httpServer: HttpServer = createServer(app)

// ─── Middleware ──────────────────────────────────
app.set("trust proxy", 1)
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true,
    }),
)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 1000, // Relaxed for development
        standardHeaders: "draft-7",
        legacyHeaders: false,
    }),
)

// ─── Better Auth (handles /api/auth/*path) ──────
app.all("/api/auth/*path", toNodeHandler(auth))

app.use(express.json())

// ─── Health Check ───────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// ─── API Routes ─────────────────────────────────
app.use("/api/workspaces", workspacesRouter)
app.use("/api", boardsRouter)
app.use("/api", columnsRouter)
app.use("/api", tasksRouter)
app.use("/api", commentsRouter)
app.use("/api", activityRouter)
app.use("/api/users", usersRouter)
app.use("/api", notificationsRouter)

// ─── Error Handler ──────────────────────────────
Sentry.setupExpressErrorHandler(app)
app.use(errorHandler)

// ─── Socket.io ──────────────────────────────────
export const io = setupSocketIO(httpServer)
app.set("io", io)
