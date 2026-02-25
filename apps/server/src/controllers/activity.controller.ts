import type { Request, Response, NextFunction } from "express"
import { ActivityService } from "../services/activity.service.js"

export class ActivityController {
    static async getUserActivity(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = Math.min(Number(req.query.limit) || 10, 50)
            const workspaceId = req.query.workspaceId as string | undefined
            const activities = await ActivityService.getUserActivity(req.user!.id, workspaceId, limit)
            res.json(activities)
        } catch (error) {
            next(error)
        }
    }

    static async getBoardActivity(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = Math.min(Number(req.query.limit) || 20, 100)
            const activities = await ActivityService.getBoardActivity(req.params.bId as string, limit)
            res.json(activities)
        } catch (error) {
            next(error)
        }
    }
}
