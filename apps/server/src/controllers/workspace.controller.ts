import type { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { WorkspaceService } from "../services/workspace.service.js"

export class WorkspaceController {
    static getUserWorkspaces = asyncHandler(async (req: Request, res: Response) => {
        const workspaces = await WorkspaceService.getUserWorkspaces(req.user!.id)
        res.json(workspaces)
    })

    static createWorkspace = asyncHandler(async (req: Request, res: Response) => {
        const workspace = await WorkspaceService.createWorkspace(req.body, req.user!.id)
        res.status(201).json(workspace)
    })

    static updateWorkspace = asyncHandler(async (req: Request, res: Response) => {
        const updated = await WorkspaceService.updateWorkspace(req.params.id as string, req.body)
        res.json(updated)
    })

    static deleteWorkspace = asyncHandler(async (req: Request, res: Response) => {
        await WorkspaceService.deleteWorkspace(req.params.id as string)
        res.status(204).end()
    })

    static regenerateInviteCode = asyncHandler(async (req: Request, res: Response) => {
        const result = await WorkspaceService.regenerateInviteCode(req.params.id as string, req.user!.id)
        res.json(result)
    })

    static joinWorkspace = asyncHandler(async (req: Request, res: Response) => {
        const result = await WorkspaceService.joinWorkspace(req.params.inviteCode as string, req.user!.id)
        res.status(200).json(result)
    })

    static getWorkspaceMembers = asyncHandler(async (req: Request, res: Response) => {
        const members = await WorkspaceService.getWorkspaceMembers(req.params.id as string)
        res.json(members)
    })

    static updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
        const updated = await WorkspaceService.updateMemberRole(req.params.id as string, req.params.userId as string, req.body)
        res.json(updated)
    })

    static removeMember = asyncHandler(async (req: Request, res: Response) => {
        await WorkspaceService.removeMember(req.params.id as string, req.params.userId as string)
        res.status(204).end()
    })

    static getWorkspaceLabels = asyncHandler(async (req: Request, res: Response) => {
        const result = await WorkspaceService.getWorkspaceLabels(req.params.id as string)
        res.json(result)
    })

    static createWorkspaceLabel = asyncHandler(async (req: Request, res: Response) => {
        const label = await WorkspaceService.createWorkspaceLabel(req.params.id as string, req.body)
        res.status(201).json(label)
    })
}
