import { db } from "../db/index.js"
import { tasks, taskAssignees, taskLabels, users, labels, columns, activity, notifications } from "../db/schema.js"
import { eq, and, sql, gte, ne } from "drizzle-orm"
import { AppError } from "../utils/AppError.js"
import type { CreateTaskInput, MoveTaskInput, UpdateTaskInput } from "../schema/task.schema.js"

export class TaskService {
    static async createTask(columnId: string, data: CreateTaskInput, userId: string, io: any) {
        // Get max position in column
        const existing = await db
            .select()
            .from(tasks)
            .where(eq(tasks.columnId, columnId))

        const maxPos = existing.reduce((max, t) => Math.max(max, t.position), -1)

        const [task] = await db
            .insert(tasks)
            .values({
                columnId,
                title: data.title,
                description: data.description,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                position: maxPos + 1,
            })
            .returning()

        if (data.assigneeIds && data.assigneeIds.length > 0) {
            await db.insert(taskAssignees).values(
                data.assigneeIds.map((uid) => ({ taskId: task.id, userId: uid })),
            )
        }

        if (data.labelIds && data.labelIds.length > 0) {
            await db.insert(taskLabels).values(
                data.labelIds.map((labelId) => ({ taskId: task.id, labelId })),
            )
        }

        const [col] = await db.select().from(columns).where(eq(columns.id, columnId))

        if (col) {
            const [log] = await db.insert(activity).values({
                boardId: col.boardId,
                taskId: task.id,
                userId,
                type: "update",
                message: `Created task "${task.title}"`,
            }).returning()

            if (data.assigneeIds && data.assigneeIds.length > 0) {
                await db.insert(notifications).values(
                    data.assigneeIds
                        .filter(uid => uid !== userId)
                        .map(uid => ({
                            userId: uid,
                            activityId: log.id
                        }))
                )
            }

            if (io) {
                io.to(`board:${col.boardId}`).emit("board:update", { type: "task:created", taskId: task.id })
            }
        }

        return task
    }

    static async getTaskById(taskId: string) {
        const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId))
        if (!task) throw AppError.notFound("Task not found")

        const assignees = await db
            .select({ id: users.id, name: users.name, email: users.email, image: users.image })
            .from(taskAssignees)
            .innerJoin(users, eq(taskAssignees.userId, users.id))
            .where(eq(taskAssignees.taskId, task.id))

        const taskLabelsList = await db
            .select({ id: labels.id, name: labels.name, color: labels.color })
            .from(taskLabels)
            .innerJoin(labels, eq(taskLabels.labelId, labels.id))
            .where(eq(taskLabels.taskId, task.id))

        return { ...task, assignees, labels: taskLabelsList }
    }

    static async updateTask(taskId: string, data: UpdateTaskInput, userId: string, io: any) {
        const updateData: any = { ...data, updatedAt: new Date() }
        if (data.dueDate) {
            updateData.dueDate = new Date(data.dueDate)
            if (isNaN(updateData.dueDate.getTime())) throw AppError.badRequest("Invalid dueDate format")
        }

        const [updated] = await db.update(tasks).set(updateData).where(eq(tasks.id, taskId)).returning()
        if (!updated) throw AppError.notFound("Task not found")

        if (updated.columnId) {
            const [column] = await db.select({ boardId: columns.boardId }).from(columns).where(eq(columns.id, updated.columnId))

            if (column) {
                const activityType = data.completed === true ? "complete" : "update"
                const message = data.completed === true ? `Completed task "${updated.title}"` : `Updated task "${updated.title}"`

                const [log] = await db.insert(activity).values({
                    boardId: column.boardId,
                    taskId: updated.id,
                    userId,
                    type: activityType,
                    message,
                }).returning()

                const assignees = await db
                    .select({ userId: taskAssignees.userId })
                    .from(taskAssignees)
                    .where(and(eq(taskAssignees.taskId, updated.id), ne(taskAssignees.userId, userId)))

                if (assignees.length > 0) {
                    await db.insert(notifications).values(assignees.map(a => ({ userId: a.userId, activityId: log.id })))
                }

                if (io) io.to(`board:${column.boardId}`).emit("board:update", { type: "task:updated", taskId: updated.id })
            }
        }

        return updated
    }

    static async deleteTask(taskId: string) {
        await db.delete(tasks).where(eq(tasks.id, taskId))
    }

    static async moveTask(taskId: string, data: MoveTaskInput, userId: string, io: any) {
        const [taskWithCol] = await db
            .select({ title: tasks.title, colName: columns.name })
            .from(tasks)
            .innerJoin(columns, eq(tasks.columnId, columns.id))
            .where(eq(tasks.id, taskId))

        await db
            .update(tasks)
            .set({ position: sql`${tasks.position} + 1` })
            .where(and(eq(tasks.columnId, data.columnId), gte(tasks.position, data.position)))

        const [updated] = await db
            .update(tasks)
            .set({ columnId: data.columnId, position: data.position, updatedAt: new Date() })
            .where(eq(tasks.id, taskId))
            .returning()

        if (!updated) throw AppError.notFound("Task not found")

        const [col] = await db.select({ boardId: columns.boardId, name: columns.name }).from(columns).where(eq(columns.id, data.columnId))

        if (col && taskWithCol) {
            const [log] = await db.insert(activity).values({
                boardId: col.boardId,
                taskId: updated.id,
                userId,
                type: "move",
                message: `Moved task "${updated.title}" from "${taskWithCol.colName}" to "${col.name}"`,
            }).returning()

            const assignees = await db.select({ userId: taskAssignees.userId }).from(taskAssignees).where(and(eq(taskAssignees.taskId, updated.id), ne(taskAssignees.userId, userId)))

            if (assignees.length > 0) {
                await db.insert(notifications).values(assignees.map(a => ({ userId: a.userId, activityId: log.id })))
            }
        }

        if (io && col) {
            const room = `board:${col.boardId}`
            io.to(room).emit("board:update", { type: "task:moved", taskId: updated.id, fromBoard: true })
            io.to(room).emit("task:move", { taskId: updated.id, toColumn: data.columnId, position: data.position })
        }

        return updated
    }

    static async addAssignee(taskId: string, targetUserId: string, userId: string) {
        const [assignee] = await db.insert(taskAssignees).values({ taskId, userId: targetUserId }).returning()

        const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId))
        if (task) {
            const [col] = await db.select({ boardId: columns.boardId }).from(columns).where(eq(columns.id, task.columnId))
            if (col) {
                const [log] = await db.insert(activity).values({
                    boardId: col.boardId,
                    taskId: task.id,
                    userId,
                    type: "member_added",
                    message: `Assigned task "${task.title}" to user`,
                }).returning()

                if (targetUserId !== userId) {
                    await db.insert(notifications).values({ userId: targetUserId, activityId: log.id })
                }
            }
        }

        return assignee
    }

    static async removeAssignee(taskId: string, targetUserId: string) {
        await db.delete(taskAssignees).where(and(eq(taskAssignees.taskId, taskId), eq(taskAssignees.userId, targetUserId)))
    }

    static async addLabel(taskId: string, labelId: string) {
        const [tl] = await db.insert(taskLabels).values({ taskId, labelId }).returning()
        return tl
    }

    static async removeLabel(taskId: string, labelId: string) {
        await db.delete(taskLabels).where(and(eq(taskLabels.taskId, taskId), eq(taskLabels.labelId, labelId)))
    }
}
