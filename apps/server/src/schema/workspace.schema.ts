import { z } from "zod"

export const createWorkspaceSchema = z.object({
    name: z.string().min(2).max(50),
    description: z.string().max(200).optional(),
})

export const updateWorkspaceSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    description: z.string().max(200).optional(),
})

export const inviteMemberSchema = z.object({
    email: z.string().email(),
})

export const updateMemberRoleSchema = z.object({
    role: z.enum(["admin", "member"]),
})

export const createLabelSchema = z.object({
    name: z.string().min(1).max(50),
    color: z.string().min(1).max(50),
})

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>
export type CreateLabelInput = z.infer<typeof createLabelSchema>
