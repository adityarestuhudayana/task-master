import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { validateBody } from "../middleware/validate.js"
import { UserController } from "../controllers/user.controller.js"
import { updateUserProfileSchema } from "../schema/user.schema.js"

const router: ReturnType<typeof Router> = Router()
router.use(requireAuth)

// PATCH /api/users/me — update profile
router.patch("/me", validateBody(updateUserProfileSchema), UserController.updateProfile)

// GET /api/users/me/dashboard — fetch dashboard stats and my tasks
router.get("/me/dashboard", UserController.getDashboardData)

export default router
