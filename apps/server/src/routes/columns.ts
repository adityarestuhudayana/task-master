import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { validateBody } from "../middleware/validate.js"
import { ColumnController } from "../controllers/column.controller.js"
import { createColumnSchema, updateColumnSchema } from "../schema/column.schema.js"

const router: ReturnType<typeof Router> = Router()
router.use(requireAuth)

// POST /api/boards/:bId/columns
router.post("/boards/:bId/columns", validateBody(createColumnSchema), ColumnController.createColumn)

// PATCH /api/columns/:id
router.patch("/columns/:id", validateBody(updateColumnSchema), ColumnController.updateColumn)

// DELETE /api/columns/:id
router.delete("/columns/:id", ColumnController.deleteColumn)

export default router
