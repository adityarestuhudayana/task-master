import type { Request, Response, NextFunction } from "express"
import { CommentService } from "../services/comment.service.js"

export class CommentController {
    static async getTaskComments(req: Request, res: Response, next: NextFunction) {
        try {
            const comments = await CommentService.getTaskComments(req.params.tId as string)
            res.json(comments)
        } catch (error) {
            next(error)
        }
    }

    static async createComment(req: Request, res: Response, next: NextFunction) {
        try {
            const comment = await CommentService.createComment(req.params.tId as string, req.body, req.user!.id)
            res.status(201).json(comment)
        } catch (error) {
            next(error)
        }
    }

    static async deleteComment(req: Request, res: Response, next: NextFunction) {
        try {
            await CommentService.deleteComment(req.params.id as string)
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }
}
