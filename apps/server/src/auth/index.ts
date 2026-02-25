import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "../db/index.js"
import * as schema from "../db/schema.js"
import { eq } from "drizzle-orm"
import { sendVerificationEmail, sendPasswordResetEmail } from "../lib/mailer.js"

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
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async (args) => {
            console.log("🛠️ sendResetPassword args:", JSON.stringify(args, null, 2))
            const { user, token } = args;
            const frontendUrl = `${process.env.CORS_ORIGIN || "http://localhost:5173"}/reset-password?token=${token}`

            sendPasswordResetEmail({
                email: user.email,
                url: frontendUrl,
            })
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            // Construct the frontend verification URL
            // The 'url' from better-auth points to the backend endpoint
            // We want it to point to our frontend VerifyEmailPage
            const token = new URL(url).searchParams.get("token")
            const frontendUrl = `${process.env.CORS_ORIGIN || "http://localhost:5173"}/verify-email?token=${token}`

            sendVerificationEmail({
                email: user.email,
                url: frontendUrl,
            })
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
