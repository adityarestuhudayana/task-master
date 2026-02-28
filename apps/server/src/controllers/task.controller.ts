import type { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { TaskService } from "../services/task.service.js"

export class TaskController {
    static createTask = asyncHandler(async (req: Request, res: Response) => {
        const io = req.app.get("io")
        const task = await TaskService.createTask(req.params.cId as string, req.body, req.user!.id, io)
        res.status(201).json(task)
    })

    static getTaskById = asyncHandler(async (req: Request, res: Response) => {
        const task = await TaskService.getTaskById(req.params.id as string)
        res.json(task)
    })

    static updateTask = asyncHandler(async (req: Request, res: Response) => {
        const io = req.app.get("io")
        const updated = await TaskService.updateTask(req.params.id as string, req.body, req.user!.id, io)
        res.json(updated)
    })

    static deleteTask = asyncHandler(async (req: Request, res: Response) => {
        await TaskService.deleteTask(req.params.id as string)
        res.status(204).end()
    })

    static moveTask = asyncHandler(async (req: Request, res: Response) => {
        const io = req.app.get("io")
        const updated = await TaskService.moveTask(req.params.id as string, req.body, req.user!.id, io)
        res.json(updated)
    })

    static addAssignee = asyncHandler(async (req: Request, res: Response) => {
        const assignee = await TaskService.addAssignee(req.params.id as string, req.body.userId, req.user!.id)
        res.status(201).json(assignee)
    })

    static removeAssignee = asyncHandler(async (req: Request, res: Response) => {
        await TaskService.removeAssignee(req.params.id as string, req.params.userId as string)
        res.status(204).end()
    })

    static addLabel = asyncHandler(async (req: Request, res: Response) => {
        const label = await TaskService.addLabel(req.params.id as string, req.body.labelId)
        res.status(201).json(label)
    })

    static removeLabel = asyncHandler(async (req: Request, res: Response) => {
        await TaskService.removeLabel(req.params.id as string, req.params.labelId as string)
        res.status(204).end()
    })
}
