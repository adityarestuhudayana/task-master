import { db } from "../db/index.js"
import { boards, columns, tasks, taskAssignees, taskLabels, labels, boardMembers, users, workspaceMembers } from "../db/schema.js"
import { eq, sql } from "drizzle-orm"
import { AppError } from "../utils/AppError.js"
import type { CreateBoardInput, UpdateBoardInput } from "../schema/board.schema.js"

export class BoardService {
    static async getBoardsInWorkspace(workspaceId: string) {
        const boardsList = await db
            .select()
            .from(boards)
            .where(eq(boards.workspaceId, workspaceId))

        const wsMembers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image,
            })
            .from(workspaceMembers)
            .innerJoin(users, eq(workspaceMembers.userId, users.id))
            .where(eq(workspaceMembers.workspaceId, workspaceId))

        return boardsList.map((board) => ({
            ...board,
            members: wsMembers,
        }))
    }

    static async createBoard(workspaceId: string, data: CreateBoardInput, userId: string) {
        const [board] = await db
            .insert(boards)
            .values({
                workspaceId,
                name: data.name,
                color: data.color || "bg-blue-500",
            })
            .returning()

        const defaultColumns = [
            { name: "To Do", color: "bg-slate-400", position: 0 },
            { name: "In Progress", color: "bg-primary", position: 1 },
            { name: "Done", color: "bg-emerald-500", position: 2 },
        ]

        await db.insert(columns).values(
            defaultColumns.map((col) => ({
                boardId: board.id,
                ...col,
            })),
        )

        await db.insert(boardMembers).values({
            boardId: board.id,
            userId,
        })

        return board
    }

    static async getBoardById(boardId: string) {
        const [board] = await db.select().from(boards).where(eq(boards.id, boardId))
        if (!board) throw AppError.notFound("Board not found")

        const cols = await db
            .select()
            .from(columns)
            .where(eq(columns.boardId, board.id))
            .orderBy(columns.position)

        const colIds = cols.map((c) => c.id)
        let allTasks: (typeof tasks.$inferSelect)[] = []
        if (colIds.length > 0) {
            allTasks = await db
                .select()
                .from(tasks)
                .where(sql`${tasks.columnId} IN ${colIds}`)
                .orderBy(tasks.position)
        }

        const taskIds = allTasks.map(t => t.id)
        let allAssignees: { taskId: string, user: { id: string, name: string | null, email: string, image: string | null } }[] = []
        let allLabels: { taskId: string, label: { id: string, name: string, color: string } }[] = []

        if (taskIds.length > 0) {
            allAssignees = await db
                .select({
                    taskId: taskAssignees.taskId,
                    user: { id: users.id, name: users.name, email: users.email, image: users.image }
                })
                .from(taskAssignees)
                .innerJoin(users, eq(taskAssignees.userId, users.id))
                .where(sql`${taskAssignees.taskId} IN ${taskIds}`)

            allLabels = await db
                .select({
                    taskId: taskLabels.taskId,
                    label: { id: labels.id, name: labels.name, color: labels.color }
                })
                .from(taskLabels)
                .innerJoin(labels, eq(taskLabels.labelId, labels.id))
                .where(sql`${taskLabels.taskId} IN ${taskIds}`)
        }

        const enrichedTasks = allTasks.map(task => {
            const taskAssigneeList = allAssignees.filter(a => a.taskId === task.id).map(a => a.user)
            const taskLabelList = allLabels.filter(l => l.taskId === task.id).map(l => l.label)
            return {
                ...task,
                assignees: taskAssigneeList,
                labels: taskLabelList
            }
        })

        const columnsWithTasks = cols.map((col) => ({
            ...col,
            tasks: enrichedTasks.filter((t) => t.columnId === col.id),
        }))

        const members = await db
            .select({ id: users.id, name: users.name, email: users.email, image: users.image })
            .from(boardMembers)
            .innerJoin(users, eq(boardMembers.userId, users.id))
            .where(eq(boardMembers.boardId, board.id))

        return { ...board, columns: columnsWithTasks, members }
    }

    static async updateBoard(boardId: string, data: UpdateBoardInput) {
        const [updated] = await db
            .update(boards)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(boards.id, boardId))
            .returning()

        if (!updated) throw AppError.notFound("Board not found")
        return updated
    }

    static async deleteBoard(boardId: string) {
        await db.delete(boards).where(eq(boards.id, boardId))
    }
}
