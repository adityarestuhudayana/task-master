import { Request, Response } from "express"
import { WorkspaceService } from "../services/workspace.service.js"

export class WorkspaceController {
    static async getUserWorkspaces(req: Request, res: Response) {
        const workspaces = await WorkspaceService.getUserWorkspaces(req.user!.id)
        res.json(workspaces)
    }

    static async createWorkspace(req: Request, res: Response) {
        const workspace = await WorkspaceService.createWorkspace(req.body, req.user!.id)
        res.status(201).json(workspace)
    }

    static async updateWorkspace(req: Request, res: Response) {
        const updated = await WorkspaceService.updateWorkspace(req.params.id as string, req.body)
        res.json(updated)
    }

    static async deleteWorkspace(req: Request, res: Response) {
        await WorkspaceService.deleteWorkspace(req.params.id as string)
        res.status(204).end()
    }

    static async regenerateInviteCode(req: Request, res: Response) {
        const result = await WorkspaceService.regenerateInviteCode(req.params.id as string, req.user!.id)
        res.json(result)
    }

    static async joinWorkspace(req: Request, res: Response) {
        const result = await WorkspaceService.joinWorkspace(req.params.inviteCode as string, req.user!.id)
        res.status(200).json(result)
    }

    static async getWorkspaceMembers(req: Request, res: Response) {
        const members = await WorkspaceService.getWorkspaceMembers(req.params.id as string)
        res.json(members)
    }

    static async updateMemberRole(req: Request, res: Response) {
        const updated = await WorkspaceService.updateMemberRole(req.params.id as string, req.params.userId as string, req.body)
        res.json(updated)
    }

    static async removeMember(req: Request, res: Response) {
        await WorkspaceService.removeMember(req.params.id as string, req.params.userId as string)
        res.status(204).end()
    }

    static async getWorkspaceLabels(req: Request, res: Response) {
        const result = await WorkspaceService.getWorkspaceLabels(req.params.id as string)
        res.json(result)
    }

    static async createWorkspaceLabel(req: Request, res: Response) {
        const label = await WorkspaceService.createWorkspaceLabel(req.params.id as string, req.body)
        res.status(201).json(label)
    }
}

