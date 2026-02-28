import { Router } from "express"
import asyncHandler from "express-async-handler"
import { requireAuth } from "../middleware/auth.js"
import { validateBody } from "../middleware/validate.js"
import { WorkspaceController } from "../controllers/workspace.controller.js"
import {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    updateMemberRoleSchema,
    createLabelSchema,
} from "../schema/workspace.schema.js"

const router: ReturnType<typeof Router> = Router()
router.use(requireAuth)

// GET /api/workspaces — list user's workspaces
router.get("/", asyncHandler(WorkspaceController.getUserWorkspaces))

// POST /api/workspaces — create workspace
router.post("/", validateBody(createWorkspaceSchema), asyncHandler(WorkspaceController.createWorkspace))

// PATCH /api/workspaces/:id — update workspace
router.patch("/:id", validateBody(updateWorkspaceSchema), asyncHandler(WorkspaceController.updateWorkspace))

// DELETE /api/workspaces/:id
router.delete("/:id", asyncHandler(WorkspaceController.deleteWorkspace))

// POST /api/workspaces/:id/invite-code — regenerate invite code
router.post("/:id/invite-code", asyncHandler(WorkspaceController.regenerateInviteCode))

// POST /api/workspaces/join/:inviteCode — join workspace via code
router.post("/join/:inviteCode", asyncHandler(WorkspaceController.joinWorkspace))

// GET /api/workspaces/:id/members
router.get("/:id/members", asyncHandler(WorkspaceController.getWorkspaceMembers))

// PATCH /api/workspaces/:id/members/:userId — change role
router.patch("/:id/members/:userId", validateBody(updateMemberRoleSchema), asyncHandler(WorkspaceController.updateMemberRole))

// DELETE /api/workspaces/:id/members/:userId
router.delete("/:id/members/:userId", asyncHandler(WorkspaceController.removeMember))

// GET /api/workspaces/:id/labels — list workspace labels
router.get("/:id/labels", asyncHandler(WorkspaceController.getWorkspaceLabels))

// POST /api/workspaces/:id/labels — create workspace label
router.post("/:id/labels", validateBody(createLabelSchema), asyncHandler(WorkspaceController.createWorkspaceLabel))

export default router
