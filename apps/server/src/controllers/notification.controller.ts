import type { Request, Response, RequestHandler } from "express"
import asyncHandler from "express-async-handler"
import { NotificationService } from "../services/notification.service.js"

export class NotificationController {
    static getNotifications: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
        const cursor = req.query.cursor as string | undefined
        const limitStr = req.query.limit as string | undefined
        const limit = limitStr ? parseInt(limitStr, 10) : 20

        const notifications = await NotificationService.getNotifications(req.user!.id, cursor, limit)
        res.json(notifications)
    })

    static markAsRead: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
        const updated = await NotificationService.markAsRead(req.params.id as string, req.user!.id)
        res.json(updated)
    })

    static markAllAsRead: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
        await NotificationService.markAllAsRead(req.user!.id)
        res.status(204).end()
    })
}
