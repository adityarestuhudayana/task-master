import type { Request, Response, NextFunction } from "express"
import { UserService } from "../services/user.service.js"

export class UserController {
    static async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const updated = await UserService.updateProfile(req.user!.id, req.body)
            res.json(updated)
        } catch (error) {
            next(error)
        }
    }

    static async getDashboardData(req: Request, res: Response, next: NextFunction) {
        try {
            const dashboardData = await UserService.getDashboardData(req.user!.id)
            res.json(dashboardData)
        } catch (error) {
            next(error)
        }
    }
}
