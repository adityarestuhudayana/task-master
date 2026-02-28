import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    // Prevent drizzle-kit from trying to drop system views like pg_stat_statements
    tablesFilter: ["users", "sessions", "accounts", "verifications", "workspaces", "workspace_members", "workspace_invitations", "boards", "board_members", "columns", "tasks", "task_assignees", "labels", "task_labels", "comments", "activity", "notifications"],
})
