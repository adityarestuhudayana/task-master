import { Router } from "express"
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
router.get("/", WorkspaceController.getUserWorkspaces)

// POST /api/workspaces — create workspace
router.post("/", validateBody(createWorkspaceSchema), WorkspaceController.createWorkspace)

// PATCH /api/workspaces/:id — update workspace
router.patch("/:id", validateBody(updateWorkspaceSchema), WorkspaceController.updateWorkspace)

// DELETE /api/workspaces/:id
router.delete("/:id", WorkspaceController.deleteWorkspace)

// POST /api/workspaces/:id/invite-code — regenerate invite code
router.post("/:id/invite-code", WorkspaceController.regenerateInviteCode)

// POST /api/workspaces/join/:inviteCode — join workspace via code
router.post("/join/:inviteCode", WorkspaceController.joinWorkspace)

// GET /api/workspaces/:id/members
router.get("/:id/members", WorkspaceController.getWorkspaceMembers)

// PATCH /api/workspaces/:id/members/:userId — change role
router.patch("/:id/members/:userId", validateBody(updateMemberRoleSchema), WorkspaceController.updateMemberRole)

// DELETE /api/workspaces/:id/members/:userId
router.delete("/:id/members/:userId", WorkspaceController.removeMember)

// GET /api/workspaces/:id/labels — list workspace labels
router.get("/:id/labels", WorkspaceController.getWorkspaceLabels)

// POST /api/workspaces/:id/labels — create workspace label
router.post("/:id/labels", validateBody(createLabelSchema), WorkspaceController.createWorkspaceLabel)

export default router
