import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { validateBody } from "../middleware/validate.js"
import { CommentController } from "../controllers/comment.controller.js"
import { createCommentSchema } from "../schema/comment.schema.js"

const router: ReturnType<typeof Router> = Router()
router.use(requireAuth)

// GET /api/tasks/:tId/comments
router.get("/tasks/:tId/comments", CommentController.getTaskComments)

// POST /api/tasks/:tId/comments
router.post("/tasks/:tId/comments", validateBody(createCommentSchema), CommentController.createComment)

// DELETE /api/comments/:id
router.delete("/comments/:id", CommentController.deleteComment)

export default router
