import type { Request, Response, NextFunction } from "express"
import { NotificationService } from "../services/notification.service.js"

export class NotificationController {
    static async getNotifications(req: Request, res: Response, next: NextFunction) {
        try {
            const notifications = await NotificationService.getNotifications(req.user!.id)
            res.json(notifications)
        } catch (error) {
            next(error)
        }
    }

    static async markAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const updated = await NotificationService.markAsRead(req.params.id as string, req.user!.id)
            res.json(updated)
        } catch (error) {
            next(error)
        }
    }

    static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            await NotificationService.markAllAsRead(req.user!.id)
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }
}
