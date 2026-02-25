import type { Request, Response, NextFunction } from "express"
import { BoardService } from "../services/board.service.js"

export class BoardController {
    static async getBoardsInWorkspace(req: Request, res: Response, next: NextFunction) {
        try {
            const boards = await BoardService.getBoardsInWorkspace(req.params.wId as string)
            res.json(boards)
        } catch (error) {
            next(error)
        }
    }

    static async createBoard(req: Request, res: Response, next: NextFunction) {
        try {
            const board = await BoardService.createBoard(req.params.wId as string, req.body, req.user!.id)
            res.status(201).json(board)
        } catch (error) {
            next(error)
        }
    }

    static async getBoardById(req: Request, res: Response, next: NextFunction) {
        try {
            const board = await BoardService.getBoardById(req.params.id as string)
            res.json(board)
        } catch (error) {
            next(error)
        }
    }

    static async updateBoard(req: Request, res: Response, next: NextFunction) {
        try {
            const updated = await BoardService.updateBoard(req.params.id as string, req.body)
            res.json(updated)
        } catch (error) {
            next(error)
        }
    }

    static async deleteBoard(req: Request, res: Response, next: NextFunction) {
        try {
            await BoardService.deleteBoard(req.params.id as string)
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }
}
