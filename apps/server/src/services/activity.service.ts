import { db } from "../db/index.js"
import { activity, users, boards, workspaceMembers } from "../db/schema.js"
import { eq, desc, and, sql } from "drizzle-orm"

export class ActivityService {
    static async getUserActivity(userId: string, workspaceId?: string, limit: number = 10) {
        const selectFields = {
            id: activity.id,
            type: activity.type,
            message: activity.message,
            createdAt: activity.createdAt,
            boardId: activity.boardId,
            taskId: activity.taskId,
            user: {
                id: users.id,
                name: users.name,
                image: users.image,
            },
        }

        const userWorkspaces = db
            .select({ id: workspaceMembers.workspaceId })
            .from(workspaceMembers)
            .where(eq(workspaceMembers.userId, userId))

        let query = db
            .select(selectFields)
            .from(activity)
            .innerJoin(users, eq(activity.userId, users.id))
            .innerJoin(boards, eq(activity.boardId, boards.id))
            .where(sql`${boards.workspaceId} IN ${userWorkspaces}`)

        if (workspaceId) {
            query = db
                .select(selectFields)
                .from(activity)
                .innerJoin(users, eq(activity.userId, users.id))
                .innerJoin(boards, eq(activity.boardId, boards.id))
                .where(and(
                    sql`${boards.workspaceId} IN ${userWorkspaces}`,
                    eq(boards.workspaceId, workspaceId)
                ))
        }

        return await query
            .orderBy(desc(activity.createdAt))
            .limit(limit)
    }

    static async getBoardActivity(boardId: string, limit: number = 20) {
        return await db
            .select({
                id: activity.id,
                type: activity.type,
                message: activity.message,
                createdAt: activity.createdAt,
                taskId: activity.taskId,
                user: {
                    id: users.id,
                    name: users.name,
                    image: users.image,
                },
            })
            .from(activity)
            .innerJoin(users, eq(activity.userId, users.id))
            .where(eq(activity.boardId, boardId))
            .orderBy(desc(activity.createdAt))
            .limit(limit)
    }
}
