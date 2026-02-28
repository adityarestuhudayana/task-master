import type { Request, Response, RequestHandler } from "express"
import asyncHandler from "express-async-handler"
import { CommentService } from "../services/comment.service.js"

export class CommentController {
    static getTaskComments: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
        const comments = await CommentService.getTaskComments(req.params.tId as string)
        res.json(comments)
    })

    static createComment: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
        const comment = await CommentService.createComment(req.params.tId as string, req.body, req.user!.id)
        res.status(201).json(comment)
    })

    static deleteComment: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
        await CommentService.deleteComment(req.params.id as string)
        res.status(204).end()
    })
}
