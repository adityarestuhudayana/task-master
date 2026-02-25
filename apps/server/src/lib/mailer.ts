import nodemailer from "nodemailer"
import { env } from "../env.js"

const hasSmtpConfig =
    (env.SMTP_HOST || env.SMTP_SERVICE) &&
    env.SMTP_USER &&
    env.SMTP_PASS

const transporter = hasSmtpConfig
    ? nodemailer.createTransport({
        pool: true,
        service: env.SMTP_SERVICE, // e.g., 'gmail'
        host: env.SMTP_HOST,
        port: env.SMTP_PORT ? Number(env.SMTP_PORT) : undefined,
        secure: env.SMTP_PORT === "465",
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS, // Use App Password for Gmail
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 30000,
    })
    : null

if (transporter) {
    transporter.verify((error) => {
        if (error) {
            console.log("❌ SMTP Connection Error:", error);
        } else {
            console.log("✅ SMTP Server is ready to take our messages");
        }
    });
}

const fromAddress = env.SMTP_FROM || env.SMTP_USER || "noreply@taskmaster.app"

/**
 * Sends a workspace invitation email.
 * If SMTP is not configured, logs the invite details to the console.
 */
export async function sendWorkspaceInvite({
    email,
    workspaceName,
    inviteLink,
    inviterName,
}: {
    email: string
    workspaceName: string
    inviteLink: string
    inviterName: string
}) {
    if (!transporter) {
        console.log("------------------------------------------")
        console.log(`📧 [EMAIL MOCK] To: ${email}`)
        console.log(`Subject: Join ${workspaceName} on TaskMaster`)
        console.log(`Body: ${inviterName} has invited you to join "${workspaceName}".`)
        console.log(`Link: ${inviteLink}`)
        console.log("------------------------------------------")
        return { success: true, mocked: true }
    }

    try {
        const info = await transporter.sendMail({
            from: `TaskMaster <${fromAddress}>`,
            to: email,
            subject: `Join ${workspaceName} on TaskMaster`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
                    <h1 style="color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 16px;">TaskMaster</h1>
                    <p style="color: #475569; font-size: 16px; line-height: 24px;">
                        Hello! <strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on TaskMaster.
                    </p>
                    <div style="margin: 32px 0;">
                        <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                            Accept Invitation
                        </a>
                    </div>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 20px;">
                        If the button doesn't work, copy and paste this link into your browser:<br/>
                        <a href="${inviteLink}" style="color: #2563eb;">${inviteLink}</a>
                    </p>
                    <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <p style="color: #94a3b8; font-size: 12px;">
                        Plan, track, and manage your tasks with ease.
                    </p>
                </div>
            `,
        })

        return { success: true, data: info }
    } catch (err) {
        console.error("❌ Failed to send email via Nodemailer:", err)
        return { success: false, error: err }
    }
}

/**
 * Sends a verification email for new account signups.
 */
export async function sendVerificationEmail({
    email,
    url,
}: {
    email: string
    url: string
}) {
    console.log(`🚀 [sendVerificationEmail] Triggered for ${email}`)
    if (!transporter) {
        console.log("------------------------------------------")
        console.log(`📧 [EMAIL MOCK] To: ${email}`)
        console.log(`Subject: Verify your TaskMaster account`)
        console.log(`Body: Click the link below to verify your email address.`)
        console.log(`Link: ${url}`)
        console.log("------------------------------------------")
        return { success: true, mocked: true }
    }

    try {
        const info = await transporter.sendMail({
            from: `TaskMaster <${fromAddress}>`,
            to: email,
            subject: "Verify your TaskMaster account",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h1 style="color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 16px;">TaskMaster</h1>
                    <p style="color: #475569; font-size: 16px; line-height: 24px;">
                        Welcome! Please verify your email address to get started with TaskMaster.
                    </p>
                    <div style="margin: 32px 0;">
                        <a href="${url}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 20px;">
                        If the button doesn't work, copy and paste this link into your browser:<br/>
                        <a href="${url}" style="color: #2563eb;">${url}</a>
                    </p>
                    <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <p style="color: #94a3b8; font-size: 12px;">
                        If you didn't create an account, you can safely ignore this email.
                    </p>
                </div>
            `,
        })

        return { success: true, data: info }
    } catch (err) {
        console.error("❌ Failed to send verification email:", err)
        // Don't crash the auth flow
        return { success: true, error: err, mocked: true }
    }
}

/**
 * Sends a password reset email.
 */
export async function sendPasswordResetEmail({
    email,
    url,
}: {
    email: string
    url: string
}) {
    console.log(`🚀 [sendPasswordResetEmail] Triggered for ${email}`)
    if (!transporter) {
        console.log("------------------------------------------")
        console.log(`📧 [EMAIL MOCK] To: ${email}`)
        console.log(`Subject: Reset your TaskMaster password`)
        console.log(`Body: Click the link below to reset your password.`)
        console.log(`Link: ${url}`)
        console.log("------------------------------------------")
        return { success: true, mocked: true }
    }

    try {
        const info = await transporter.sendMail({
            from: `TaskMaster <${fromAddress}>`,
            to: email,
            subject: "Reset your TaskMaster password",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h1 style="color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 16px;">TaskMaster</h1>
                    <p style="color: #475569; font-size: 16px; line-height: 24px;">
                        We received a request to reset your password. Click the button below to choose a new one.
                    </p>
                    <div style="margin: 32px 0;">
                        <a href="${url}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 20px;">
                        If the button doesn't work, copy and paste this link into your browser:<br/>
                        <a href="${url}" style="color: #2563eb;">${url}</a>
                    </p>
                    <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <p style="color: #94a3b8; font-size: 12px;">
                        If you didn't request a password reset, you can safely ignore this email.
                    </p>
                </div>
            `,
        })

        return { success: true, data: info }
    } catch (err) {
        console.error("❌ Failed to send password reset email:", err)
        return { success: true, error: err, mocked: true }
    }
}
