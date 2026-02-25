import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { ActivityController } from "../controllers/activity.controller.js"

const router: ReturnType<typeof Router> = Router()
router.use(requireAuth)

// GET /api/activity — user's recent activity (optionally scoped to a workspace)
router.get("/activity", ActivityController.getUserActivity)

// GET /api/boards/:bId/activity — board activity
router.get("/boards/:bId/activity", ActivityController.getBoardActivity)

export default router
