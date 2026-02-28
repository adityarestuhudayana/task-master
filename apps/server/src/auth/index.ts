import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "../db/index.js"
import * as schema from "../db/schema.js"
import { eq } from "drizzle-orm"
import { env } from "../env.js"

export const auth = betterAuth({
    baseURL: (process.env.BETTER_AUTH_URL || "http://localhost:3000") + "/api/auth",
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
        },
    }),
    advanced: {
        crossSubDomainCookies: {
            enabled: false,
        },
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
            httpOnly: true,
            partitioned: true,
        },
    },
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
    session: {
        cookieCache: {
            enabled: false,
        },
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    // Check for pending workspace invitations
                    const invites = await db
                        .select()
                        .from(schema.workspaceInvitations)
                        .where(eq(schema.workspaceInvitations.email, user.email))

                    for (const invite of invites) {
                        // Join the workspace
                        await db.insert(schema.workspaceMembers).values({
                            workspaceId: invite.workspaceId,
                            userId: user.id,
                            role: invite.role,
                        })

                        // Delete the invitation
                        await db
                            .delete(schema.workspaceInvitations)
                            .where(eq(schema.workspaceInvitations.id, invite.id))
                    }
                },
            },
        },
    },
    trustedOrigins: [process.env.CORS_ORIGIN || "http://localhost:5173"],
})
