import { db } from "../db/index.js"
import { columns } from "../db/schema.js"
import { eq } from "drizzle-orm"
import { AppError } from "../utils/AppError.js"
import type { CreateColumnInput, UpdateColumnInput } from "../schema/column.schema.js"

export class ColumnService {
    static async createColumn(boardId: string, data: CreateColumnInput) {
        const existing = await db
            .select()
            .from(columns)
            .where(eq(columns.boardId, boardId))

        const maxPos = existing.reduce((max, c) => Math.max(max, c.position), -1)

        const [column] = await db
            .insert(columns)
            .values({
                boardId,
                name: data.name,
                color: data.color || "bg-slate-400",
                position: maxPos + 1,
            })
            .returning()

        return column
    }

    static async updateColumn(columnId: string, data: UpdateColumnInput) {
        const [updated] = await db
            .update(columns)
            .set(data)
            .where(eq(columns.id, columnId))
            .returning()

        if (!updated) throw AppError.notFound("Column not found")
        return updated
    }

    static async deleteColumn(columnId: string) {
        await db.delete(columns).where(eq(columns.id, columnId))
    }
}
