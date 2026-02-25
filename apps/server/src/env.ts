import { z } from "zod"


const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.string().regex(/^\d+$/).default("3000"),
    DATABASE_URL: z.string().url(),
    CORS_ORIGIN: z.string().url().default("http://localhost:5173"),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
    SENTRY_DSN: z.string().url().optional(),
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.string().regex(/^\d+$/).optional(),
    SMTP_SERVICE: z.string().min(1).optional(),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASS: z.string().min(1).optional(),
    SMTP_FROM: z.string().min(1).optional(),
    CLOUDINARY_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_API_SECRET: z.string().min(1).optional(),
    VITE_CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
}).refine((data) => {
    if (data.NODE_ENV === "production") {
        return (
            (data.SMTP_HOST || data.SMTP_SERVICE) &&
            data.SMTP_USER &&
            data.SMTP_PASS
        )
    }
    return true
}, {
    message: "SMTP configuration is required in production (SMTP_USER, SMTP_PASS, and either SMTP_HOST or SMTP_SERVICE)",
    path: ["SMTP_USER"]
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
    console.error("❌ Invalid environment variables:")
    for (const [key, value] of Object.entries(_env.error.flatten().fieldErrors)) {
        console.error(`- ${key}: ${value}`)
    }
    process.exit(1)
}

export const env = _env.data
