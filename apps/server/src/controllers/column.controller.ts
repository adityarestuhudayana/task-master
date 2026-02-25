import type { Request, Response, NextFunction } from "express"
import { ColumnService } from "../services/column.service.js"

export class ColumnController {
    static async createColumn(req: Request, res: Response, next: NextFunction) {
        try {
            const column = await ColumnService.createColumn(req.params.bId as string, req.body)
            res.status(201).json(column)
        } catch (error) {
            next(error)
        }
    }

    static async updateColumn(req: Request, res: Response, next: NextFunction) {
        try {
            const updated = await ColumnService.updateColumn(req.params.id as string, req.body)
            res.json(updated)
        } catch (error) {
            next(error)
        }
    }

    static async deleteColumn(req: Request, res: Response, next: NextFunction) {
        try {
            await ColumnService.deleteColumn(req.params.id as string)
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }
}
