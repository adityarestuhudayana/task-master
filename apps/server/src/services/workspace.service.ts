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
        const [workspace] = await db
            .insert(workspaces)
            .values({
                name: data.name,
                description: data.description,
                ownerId: userId,
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

    static async inviteMember(workspaceId: string, data: InviteMemberInput, inviterName: string) {
        const [user] = await db.select().from(users).where(eq(users.email, data.email))
        const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId))

        if (!workspace) throw AppError.notFound("Workspace not found")

        if (user) {
            const [existing] = await db
                .select()
                .from(workspaceMembers)
                .where(
                    and(
                        eq(workspaceMembers.workspaceId, workspaceId),
                        eq(workspaceMembers.userId, user.id),
                    ),
                )

            if (existing) throw AppError.conflict("User is already a member")

            const [member] = await db
                .insert(workspaceMembers)
                .values({
                    workspaceId,
                    userId: user.id,
                    role: "member",
                })
                .returning()

            sendWorkspaceInvite({
                email: data.email,
                workspaceName: workspace.name,
                inviteLink: `${process.env.CORS_ORIGIN || "http://localhost:5173"}/dashboard`,
                inviterName,
            })

            return member
        }

        const token = randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        const [invitation] = await db
            .insert(workspaceInvitations)
            .values({
                workspaceId,
                email: data.email,
                token,
                expiresAt,
                role: "member",
            })
            .returning()

        const inviteLink = `${process.env.CORS_ORIGIN || "http://localhost:5173"}/signup?token=${token}&email=${encodeURIComponent(data.email)}`

        sendWorkspaceInvite({
            email: data.email,
            workspaceName: workspace.name,
            inviteLink,
            inviterName,
        })

        return { message: "Invitation sent", invitationId: invitation.id }
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
