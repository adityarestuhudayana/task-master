import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { validateBody } from "../middleware/validate.js"
import { BoardController } from "../controllers/board.controller.js"
import { createBoardSchema, updateBoardSchema } from "../schema/board.schema.js"

const router: ReturnType<typeof Router> = Router()
router.use(requireAuth)

// GET /api/workspaces/:wId/boards — list boards in workspace
router.get("/workspaces/:wId/boards", BoardController.getBoardsInWorkspace)

// POST /api/workspaces/:wId/boards — create board
router.post("/workspaces/:wId/boards", validateBody(createBoardSchema), BoardController.createBoard)

// GET /api/boards/:id — full board with columns, tasks, and nested data
router.get("/boards/:id", BoardController.getBoardById)

// PATCH /api/boards/:id
router.patch("/boards/:id", validateBody(updateBoardSchema), BoardController.updateBoard)

// DELETE /api/boards/:id
router.delete("/boards/:id", BoardController.deleteBoard)

export default router
