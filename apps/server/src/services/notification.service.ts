import { db } from "../db/index.js"
import { notifications, activity, users } from "../db/schema.js"
import { eq, and, desc, lt } from "drizzle-orm"
import { AppError } from "../utils/AppError.js"

export class NotificationService {
    static async getNotifications(userId: string, cursor?: string, limit: number = 20) {
        let conditions = eq(notifications.userId, userId)
        if (cursor) {
            conditions = and(conditions, lt(notifications.createdAt, new Date(cursor))) as any
        }

        const data = await db
            .select({
                id: notifications.id,
                isRead: notifications.isRead,
                createdAt: notifications.createdAt,
                activity: {
                    type: activity.type,
                    message: activity.message,
                    taskId: activity.taskId,
                    boardId: activity.boardId,
                },
                actor: {
                    name: users.name,
                    image: users.image,
                }
            })
            .from(notifications)
            .innerJoin(activity, eq(notifications.activityId, activity.id))
            .innerJoin(users, eq(activity.userId, users.id))
            .where(conditions)
            .orderBy(desc(notifications.createdAt))
            .limit(limit)

        let nextCursor: string | undefined = undefined
        if (data.length === limit) {
            nextCursor = data[data.length - 1].createdAt.toISOString()
        }

        return {
            data,
            nextCursor
        }
    }

    static async markAsRead(notificationId: string, userId: string) {
        const [updated] = await db
            .update(notifications)
            .set({ isRead: true })
            .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
            .returning()

        if (!updated) throw AppError.notFound("Notification not found")
        return updated
    }

    static async markAllAsRead(userId: string) {
        await db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId))
    }
}
