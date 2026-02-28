import { pgTable, uuid, text, varchar, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core"

// ─── Enums ────────────────────────────────────────
export const workspaceRoleEnum = pgEnum("workspace_role", ["owner", "admin", "member"])
export const boardStatusEnum = pgEnum("board_status", ["active", "in-review", "planning", "archived"])
export const activityTypeEnum = pgEnum("activity_type", ["update", "complete", "member_added", "comment", "move"])

// ─── Users ────────────────────────────────────────
export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

// ─── Better Auth Sessions ─────────────────────────
export const sessions = pgTable("sessions", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

// ─── Better Auth Accounts ─────────────────────────
export const accounts = pgTable("accounts", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

// ─── Better Auth Verifications ────────────────────
export const verifications = pgTable("verifications", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

// ─── Workspaces ───────────────────────────────────
export const workspaces = pgTable("workspaces", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    ownerId: text("owner_id").notNull().references(() => users.id),
    inviteCode: varchar("invite_code", { length: 50 }).unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const workspaceMembers = pgTable("workspace_members", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: workspaceRoleEnum("role").default("member").notNull(),
})

export const workspaceInvitations = pgTable("workspace_invitations", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    role: workspaceRoleEnum("role").default("member").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

// ─── Boards ───────────────────────────────────────
export const boards = pgTable("boards", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    color: varchar("color", { length: 50 }).default("bg-blue-500").notNull(),
    status: boardStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const boardMembers = pgTable("board_members", {
    id: uuid("id").defaultRandom().primaryKey(),
    boardId: uuid("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
})

// ─── Columns ──────────────────────────────────────
export const columns = pgTable("columns", {
    id: uuid("id").defaultRandom().primaryKey(),
    boardId: uuid("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    color: varchar("color", { length: 50 }).default("bg-slate-400").notNull(),
    position: integer("position").default(0).notNull(),
})

// ─── Tasks ────────────────────────────────────────
export const tasks = pgTable("tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
    columnId: uuid("column_id").notNull().references(() => columns.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    position: integer("position").default(0).notNull(),
    completed: boolean("completed").default(false).notNull(),
    flagged: boolean("flagged").default(false).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const taskAssignees = pgTable("task_assignees", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
})

// ─── Labels ───────────────────────────────────────
export const labels = pgTable("labels", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 50 }).notNull(),
    color: varchar("color", { length: 50 }).notNull(),
})

export const taskLabels = pgTable("task_labels", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    labelId: uuid("label_id").notNull().references(() => labels.id, { onDelete: "cascade" }),
})

// ─── Comments ─────────────────────────────────────
export const comments = pgTable("comments", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

// ─── Activity Log ─────────────────────────────────
export const activity = pgTable("activity", {
    id: uuid("id").defaultRandom().primaryKey(),
    boardId: uuid("board_id").references(() => boards.id, { onDelete: "cascade" }),
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "set null" }),
    userId: text("user_id").notNull().references(() => users.id),
    type: activityTypeEnum("type").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

// ─── Notifications ─────────────────────────────────
export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    activityId: uuid("activity_id").notNull().references(() => activity.id, { onDelete: "cascade" }),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})
