import type { Request, Response, NextFunction } from "express"
import { WorkspaceService } from "../services/workspace.service.js"

export class WorkspaceController {
    static async getUserWorkspaces(req: Request, res: Response, next: NextFunction) {
        try {
            const workspaces = await WorkspaceService.getUserWorkspaces(req.user!.id)
            res.json(workspaces)
        } catch (error) {
            next(error)
        }
    }

    static async createWorkspace(req: Request, res: Response, next: NextFunction) {
        try {
            const workspace = await WorkspaceService.createWorkspace(req.body, req.user!.id)
            res.status(201).json(workspace)
        } catch (error) {
            next(error)
        }
    }

    static async updateWorkspace(req: Request, res: Response, next: NextFunction) {
        try {
            const updated = await WorkspaceService.updateWorkspace(req.params.id as string, req.body)
            res.json(updated)
        } catch (error) {
            next(error)
        }
    }

    static async deleteWorkspace(req: Request, res: Response, next: NextFunction) {
        try {
            await WorkspaceService.deleteWorkspace(req.params.id as string)
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    static async inviteMember(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await WorkspaceService.inviteMember(req.params.id as string, req.body, req.user!.name)
            res.status(201).json(result)
        } catch (error) {
            next(error)
        }
    }

    static async getWorkspaceMembers(req: Request, res: Response, next: NextFunction) {
        try {
            const members = await WorkspaceService.getWorkspaceMembers(req.params.id as string)
            res.json(members)
        } catch (error) {
            next(error)
        }
    }

    static async updateMemberRole(req: Request, res: Response, next: NextFunction) {
        try {
            const updated = await WorkspaceService.updateMemberRole(req.params.id as string, req.params.userId as string, req.body)
            res.json(updated)
        } catch (error) {
            next(error)
        }
    }

    static async removeMember(req: Request, res: Response, next: NextFunction) {
        try {
            await WorkspaceService.removeMember(req.params.id as string, req.params.userId as string)
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    static async getWorkspaceLabels(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await WorkspaceService.getWorkspaceLabels(req.params.id as string)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    static async createWorkspaceLabel(req: Request, res: Response, next: NextFunction) {
        try {
            const label = await WorkspaceService.createWorkspaceLabel(req.params.id as string, req.body)
            res.status(201).json(label)
        } catch (error) {
            next(error)
        }
    }
}
