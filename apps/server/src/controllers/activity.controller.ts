import type { Request, Response, RequestHandler } from "express"
import asyncHandler from "express-async-handler"
import { ActivityService } from "../services/activity.service.js"

export class ActivityController {
    static getUserActivity: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
        const limit = Math.min(Number(req.query.limit) || 10, 50)
        const workspaceId = req.query.workspaceId as string | undefined
        const activities = await ActivityService.getUserActivity(req.user!.id, workspaceId, limit)
        res.json(activities)
    })

    static getBoardActivity: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
        const limit = Math.min(Number(req.query.limit) || 20, 100)
        const activities = await ActivityService.getBoardActivity(req.params.bId as string, limit)
        res.json(activities)
    })
}
