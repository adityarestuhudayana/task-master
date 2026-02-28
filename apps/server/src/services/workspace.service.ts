import { db } from "../db/index.js"
import { workspaces, workspaceMembers, users, labels, workspaceInvitations } from "../db/schema.js"
import { eq, and } from "drizzle-orm"
import { randomUUID } from "node:crypto"
import { sendWorkspaceInvite } from "../lib/mailer.js"
import { AppError } from "../utils/AppError.js"
import type {
    CreateWorkspaceInput,
    UpdateWorkspaceInput,
    InviteMemberInput,
    UpdateMemberRoleInput,
    CreateLabelInput,
} from "../schema/workspace.schema.js"

export class WorkspaceService {
    static async getUserWorkspaces(userId: string) {
        const memberships = await db
            .select({
                workspace: workspaces,
                role: workspaceMembers.role,
            })
            .from(workspaceMembers)
            .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
            .where(eq(workspaceMembers.userId, userId))

        return memberships.map((m) => ({ ...m.workspace, role: m.role }))
    }

    static async createWorkspace(data: CreateWorkspaceInput, userId: string) {
        const { nanoid } = await import("nanoid")
        const code = nanoid(10)

        const [workspace] = await db
            .insert(workspaces)
            .values({
                name: data.name,
                description: data.description,
                ownerId: userId,
                inviteCode: code,
            })
            .returning()

        await db.insert(workspaceMembers).values({
            workspaceId: workspace.id,
            userId,
            role: "owner",
        })

        return workspace
    }

    static async updateWorkspace(workspaceId: string, data: UpdateWorkspaceInput) {
        const [updated] = await db
            .update(workspaces)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(workspaces.id, workspaceId))
            .returning()

        if (!updated) throw AppError.notFound("Workspace not found")
        return updated
    }

    static async deleteWorkspace(workspaceId: string) {
        await db.delete(workspaces).where(eq(workspaces.id, workspaceId))
    }

    static async regenerateInviteCode(workspaceId: string, userId: string) {
        const [membership] = await db
            .select()
            .from(workspaceMembers)
            .where(
                and(
                    eq(workspaceMembers.workspaceId, workspaceId),
                    eq(workspaceMembers.userId, userId)
                )
            )

        if (!membership || membership.role !== "owner" && membership.role !== "admin") {
            throw AppError.forbidden("Only admins can regenerate the invite code")
        }

        const { nanoid } = await import("nanoid")
        const newCode = nanoid(10)

        const [updated] = await db
            .update(workspaces)
            .set({ inviteCode: newCode, updatedAt: new Date() })
            .where(eq(workspaces.id, workspaceId))
            .returning()

        return { inviteCode: updated.inviteCode }
    }

    static async joinWorkspace(inviteCode: string, userId: string) {
        const [workspace] = await db.select().from(workspaces).where(eq(workspaces.inviteCode, inviteCode))

        if (!workspace) throw AppError.notFound("Invalid invite link")

        const [existing] = await db
            .select()
            .from(workspaceMembers)
            .where(
                and(
                    eq(workspaceMembers.workspaceId, workspace.id),
                    eq(workspaceMembers.userId, userId),
                ),
            )

        if (existing) {
            return { workspaceId: workspace.id, message: "Already a member" }
        }

        await db
            .insert(workspaceMembers)
            .values({
                workspaceId: workspace.id,
                userId: userId,
                role: "member",
            })

        return { workspaceId: workspace.id, message: "Successfully joined workspace" }
    }

    static async getWorkspaceMembers(workspaceId: string) {
        return await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image,
                role: workspaceMembers.role,
            })
            .from(workspaceMembers)
            .innerJoin(users, eq(workspaceMembers.userId, users.id))
            .where(eq(workspaceMembers.workspaceId, workspaceId))
    }

    static async updateMemberRole(workspaceId: string, userId: string, data: UpdateMemberRoleInput) {
        const [updated] = await db
            .update(workspaceMembers)
            .set({ role: data.role })
            .where(
                and(
                    eq(workspaceMembers.workspaceId, workspaceId),
                    eq(workspaceMembers.userId, userId),
                ),
            )
            .returning()

        if (!updated) throw AppError.notFound("Member not found")
        return updated
    }

    static async removeMember(workspaceId: string, userId: string) {
        await db
            .delete(workspaceMembers)
            .where(
                and(
                    eq(workspaceMembers.workspaceId, workspaceId),
                    eq(workspaceMembers.userId, userId),
                ),
            )
    }

    static async getWorkspaceLabels(workspaceId: string) {
        return await db
            .select()
            .from(labels)
            .where(eq(labels.workspaceId, workspaceId))
    }

    static async createWorkspaceLabel(workspaceId: string, data: CreateLabelInput) {
        const [label] = await db
            .insert(labels)
            .values({
                workspaceId,
                name: data.name,
                color: data.color,
            })
            .returning()

        return label
    }
}
