import { db } from "../db/index.js"
import { comments, users, tasks, columns, activity, notifications, taskAssignees } from "../db/schema.js"
import { eq, desc, ne, and } from "drizzle-orm"
import { AppError } from "../utils/AppError.js"
import type { CreateCommentInput } from "../schema/comment.schema.js"

export class CommentService {
    static async getTaskComments(taskId: string) {
        return await db
            .select({
                id: comments.id,
                content: comments.content,
                createdAt: comments.createdAt,
                updatedAt: comments.updatedAt,
                author: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    image: users.image,
                },
            })
            .from(comments)
            .innerJoin(users, eq(comments.authorId, users.id))
            .where(eq(comments.taskId, taskId))
            .orderBy(desc(comments.createdAt))
    }

    static async createComment(taskId: string, data: CreateCommentInput, userId: string) {
        const [comment] = await db
            .insert(comments)
            .values({
                taskId,
                authorId: userId,
                content: data.content,
            })
            .returning()

        const [task] = await db
            .select({ columnId: tasks.columnId, title: tasks.title })
            .from(tasks)
            .where(eq(tasks.id, taskId))

        if (task) {
            const [col] = await db
                .select({ boardId: columns.boardId })
                .from(columns)
                .where(eq(columns.id, task.columnId))

            if (col) {
                const [log] = await db.insert(activity).values({
                    boardId: col.boardId,
                    taskId,
                    userId,
                    type: "comment",
                    message: `Commented on "${task.title}"`,
                }).returning()

                const assignees = await db
                    .select({ userId: taskAssignees.userId })
                    .from(taskAssignees)
                    .where(and(
                        eq(taskAssignees.taskId, taskId),
                        ne(taskAssignees.userId, userId)
                    ))

                if (assignees.length > 0) {
                    await db.insert(notifications).values(
                        assignees.map(a => ({
                            userId: a.userId,
                            activityId: log.id,
                        }))
                    )
                }
            }
        }

        return comment
    }

    static async deleteComment(commentId: string) {
        await db.delete(comments).where(eq(comments.id, commentId))
    }
}
