import type { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { ColumnService } from "../services/column.service.js"

export class ColumnController {
    static createColumn = asyncHandler(async (req: Request, res: Response) => {
        const column = await ColumnService.createColumn(req.params.bId as string, req.body)
        res.status(201).json(column)
    })

    static updateColumn = asyncHandler(async (req: Request, res: Response) => {
        const updated = await ColumnService.updateColumn(req.params.id as string, req.body)
        res.json(updated)
    })

    static deleteColumn = asyncHandler(async (req: Request, res: Response) => {
        await ColumnService.deleteColumn(req.params.id as string)
        res.status(204).end()
    })
}
