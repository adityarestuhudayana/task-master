import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { validateBody } from "../middleware/validate.js"
import { TaskController } from "../controllers/task.controller.js"
import {
    createTaskSchema,
    updateTaskSchema,
    moveTaskSchema,
    addTaskAssigneeSchema,
    addTaskLabelSchema
} from "../schema/task.schema.js"

const router: ReturnType<typeof Router> = Router()
router.use(requireAuth)

// POST /api/columns/:cId/tasks — create task
router.post("/columns/:cId/tasks", validateBody(createTaskSchema), TaskController.createTask)

// GET /api/tasks/:id — task detail with assignees, labels, comments count
router.get("/tasks/:id", TaskController.getTaskById)

// PATCH /api/tasks/:id — update task
router.patch("/tasks/:id", validateBody(updateTaskSchema), TaskController.updateTask)

// DELETE /api/tasks/:id
router.delete("/tasks/:id", TaskController.deleteTask)

// PATCH /api/tasks/:id/move — move task to different column/position
router.patch("/tasks/:id/move", validateBody(moveTaskSchema), TaskController.moveTask)

// POST /api/tasks/:id/assignees — add assignee
router.post("/tasks/:id/assignees", validateBody(addTaskAssigneeSchema), TaskController.addAssignee)

// DELETE /api/tasks/:id/assignees/:userId
router.delete("/tasks/:id/assignees/:userId", TaskController.removeAssignee)

// POST /api/tasks/:id/labels — add label
router.post("/tasks/:id/labels", validateBody(addTaskLabelSchema), TaskController.addLabel)

// DELETE /api/tasks/:id/labels/:labelId
router.delete("/tasks/:id/labels/:labelId", TaskController.removeLabel)

export default router
