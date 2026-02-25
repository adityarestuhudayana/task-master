import { db } from "../db/index.js"
import { notifications, activity, users } from "../db/schema.js"
import { eq, and, desc } from "drizzle-orm"
import { AppError } from "../utils/AppError.js"

export class NotificationService {
    static async getNotifications(userId: string) {
        return await db
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
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(50)
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
