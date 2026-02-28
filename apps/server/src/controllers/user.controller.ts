import type { Request, Response, RequestHandler } from "express"
import asyncHandler from "express-async-handler"
import { UserService } from "../services/user.service.js"

export class UserController {
    static updateProfile: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
        const updated = await UserService.updateProfile(req.user!.id, req.body)
        res.json(updated)
    })

    static getDashboardData: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
        const dashboardData = await UserService.getDashboardData(req.user!.id)
        res.json(dashboardData)
    })
}
