import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { NotificationController } from "../controllers/notification.controller.js"

const router: ReturnType<typeof Router> = Router()

// Apply authentication to all notification routes
router.use(requireAuth)

// GET /api/notifications - Get unread and recent notifications for the current user
router.get("/notifications", NotificationController.getNotifications)

// PATCH /api/notifications/:id/read - Mark a specific notification as read
router.patch("/notifications/:id/read", NotificationController.markAsRead)

// POST /api/notifications/read-all - Mark all unread notifications as read
router.post("/notifications/read-all", NotificationController.markAllAsRead)

export default router
