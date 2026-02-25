import type { Request, Response, NextFunction } from "express"
import { auth } from "../auth/index.js"
import { fromNodeHeaders } from "better-auth/node"

// Extend Express Request to include user session
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string
                name: string
                email: string
                image?: string | null
            }
            session?: {
                id: string
                userId: string
                token: string
                expiresAt: Date
            }
        }
    }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        })

        if (!session) {
            res.status(401).json({ error: "Unauthorized" })
            return
        }

        req.user = session.user
        req.session = session.session
        next()
    } catch {
        res.status(401).json({ error: "Unauthorized" })
    }
}
