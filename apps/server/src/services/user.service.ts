import { db } from "../db/index.js"
import { users, tasks, taskAssignees, boards, columns, boardMembers, taskLabels, labels, workspaces } from "../db/schema.js"
import { eq, and, ne, isNull, count, sql, asc } from "drizzle-orm"
import { deleteImageByUrl } from "../lib/cloudinary.js"
import type { UpdateUserProfileInput } from "../schema/user.schema.js"

export class UserService {
    static async updateProfile(userId: string, data: UpdateUserProfileInput) {
        const updateData: Record<string, unknown> = { updatedAt: new Date() }
        if (data.displayName) updateData.name = data.displayName
        if (data.email) updateData.email = data.email
        if (data.image !== undefined) updateData.image = data.image

        const [oldUser] = await db
            .select({ image: users.image })
            .from(users)
            .where(eq(users.id, userId))

        const [updated] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning()

        if (data.image !== undefined && oldUser?.image && oldUser.image !== data.image) {
            deleteImageByUrl(oldUser.image).catch(console.error)
        }

        return updated
    }

    static async getDashboardData(userId: string) {
        const [totalTasksResult] = await db
            .select({ count: count(tasks.id) })
            .from(tasks)
            .innerJoin(columns, eq(tasks.columnId, columns.id))
            .innerJoin(boards, eq(columns.boardId, boards.id))
            .innerJoin(boardMembers, eq(boards.id, boardMembers.boardId))
            .where(eq(boardMembers.userId, userId))

        const [completedTasksResult] = await db
            .select({ count: count(tasks.id) })
            .from(tasks)
            .innerJoin(columns, eq(tasks.columnId, columns.id))
            .innerJoin(boards, eq(columns.boardId, boards.id))
            .innerJoin(boardMembers, eq(boards.id, boardMembers.boardId))
            .where(and(eq(boardMembers.userId, userId), eq(tasks.completed, true)))

        const [activeBoardsResult] = await db
            .select({ count: count(boards.id) })
            .from(boards)
            .innerJoin(boardMembers, eq(boards.id, boardMembers.boardId))
            .where(and(eq(boardMembers.userId, userId), eq(boards.status, "active")))

        const now = new Date()
        const [overdueTasksResult] = await db
            .select({ count: count(tasks.id) })
            .from(tasks)
            .innerJoin(taskAssignees, eq(tasks.id, taskAssignees.taskId))
            .where(
                and(
                    eq(taskAssignees.userId, userId),
                    eq(tasks.completed, false),
                    sql`${tasks.dueDate} < ${now.toISOString()}::timestamp`
                )
            )

        const myTasksRaw = await db
            .select({
                id: tasks.id,
                title: tasks.title,
                dueDate: tasks.dueDate,
                flagged: tasks.flagged,
                boardId: boards.id,
                boardName: boards.name,
                workspaceId: workspaces.id,
                workspaceName: workspaces.name,
                colId: columns.id,
            })
            .from(tasks)
            .innerJoin(taskAssignees, eq(tasks.id, taskAssignees.taskId))
            .innerJoin(columns, eq(tasks.columnId, columns.id))
            .innerJoin(boards, eq(columns.boardId, boards.id))
            .innerJoin(workspaces, eq(boards.workspaceId, workspaces.id))
            .where(
                and(
                    eq(taskAssignees.userId, userId),
                    eq(tasks.completed, false)
                )
            )
            .orderBy(asc(tasks.dueDate))
            .limit(20)

        const myTasksId = myTasksRaw.map(t => t.id)
        let labelsLookup: Record<string, any[]> = {}

        if (myTasksId.length > 0) {
            const tasksLabels = await db
                .select({
                    taskId: taskLabels.taskId,
                    labelId: labels.id,
                    name: labels.name,
                    color: labels.color
                })
                .from(taskLabels)
                .innerJoin(labels, eq(taskLabels.labelId, labels.id))
                .where(sql`${taskLabels.taskId} IN (${sql.join(myTasksId, sql`, `)})`)

            labelsLookup = tasksLabels.reduce((acc, l) => {
                if (!acc[l.taskId]) acc[l.taskId] = []
                acc[l.taskId].push({ id: l.labelId, name: l.name, color: l.color })
                return acc
            }, {} as Record<string, any[]>)
        }

        const myTasks = myTasksRaw.map(t => ({
            ...t,
            labels: labelsLookup[t.id] || []
        }))

        return {
            stats: {
                totalTasks: totalTasksResult?.count || 0,
                completedTasks: completedTasksResult?.count || 0,
                overdueTasks: overdueTasksResult?.count || 0,
                activeBoards: activeBoardsResult?.count || 0,
            },
            myTasks
        }
    }
}
