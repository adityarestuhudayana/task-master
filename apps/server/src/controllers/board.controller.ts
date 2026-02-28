import type { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { BoardService } from "../services/board.service.js"

export class BoardController {
    static getBoardsInWorkspace = asyncHandler(async (req: Request, res: Response) => {
        const boards = await BoardService.getBoardsInWorkspace(req.params.wId as string)
        res.json(boards)
    })

    static createBoard = asyncHandler(async (req: Request, res: Response) => {
        const board = await BoardService.createBoard(req.params.wId as string, req.body, req.user!.id)
        res.status(201).json(board)
    })

    static getBoardById = asyncHandler(async (req: Request, res: Response) => {
        const board = await BoardService.getBoardById(req.params.id as string)
        res.json(board)
    })

    static updateBoard = asyncHandler(async (req: Request, res: Response) => {
        const updated = await BoardService.updateBoard(req.params.id as string, req.body)
        res.json(updated)
    })

    static deleteBoard = asyncHandler(async (req: Request, res: Response) => {
        await BoardService.deleteBoard(req.params.id as string)
        res.status(204).end()
    })
}
