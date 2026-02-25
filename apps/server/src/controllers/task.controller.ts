import type { Request, Response, NextFunction } from "express"
import { TaskService } from "../services/task.service.js"

export class TaskController {
    static async createTask(req: Request, res: Response, next: NextFunction) {
        try {
            const io = req.app.get("io")
            const task = await TaskService.createTask(req.params.cId as string, req.body, req.user!.id, io)
            res.status(201).json(task)
        } catch (error) {
            next(error)
        }
    }

    static async getTaskById(req: Request, res: Response, next: NextFunction) {
        try {
            const task = await TaskService.getTaskById(req.params.id as string)
            res.json(task)
        } catch (error) {
            next(error)
        }
    }

    static async updateTask(req: Request, res: Response, next: NextFunction) {
        try {
            const io = req.app.get("io")
            const updated = await TaskService.updateTask(req.params.id as string, req.body, req.user!.id, io)
            res.json(updated)
        } catch (error) {
            next(error)
        }
    }

    static async deleteTask(req: Request, res: Response, next: NextFunction) {
        try {
            await TaskService.deleteTask(req.params.id as string)
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    static async moveTask(req: Request, res: Response, next: NextFunction) {
        try {
            const io = req.app.get("io")
            const updated = await TaskService.moveTask(req.params.id as string, req.body, req.user!.id, io)
            res.json(updated)
        } catch (error) {
            next(error)
        }
    }

    static async addAssignee(req: Request, res: Response, next: NextFunction) {
        try {
            const assignee = await TaskService.addAssignee(req.params.id as string, req.body.userId, req.user!.id)
            res.status(201).json(assignee)
        } catch (error) {
            next(error)
        }
    }

    static async removeAssignee(req: Request, res: Response, next: NextFunction) {
        try {
            await TaskService.removeAssignee(req.params.id as string, req.params.userId as string)
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    static async addLabel(req: Request, res: Response, next: NextFunction) {
        try {
            const label = await TaskService.addLabel(req.params.id as string, req.body.labelId)
            res.status(201).json(label)
        } catch (error) {
            next(error)
        }
    }

    static async removeLabel(req: Request, res: Response, next: NextFunction) {
        try {
            await TaskService.removeLabel(req.params.id as string, req.params.labelId as string)
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }
}
