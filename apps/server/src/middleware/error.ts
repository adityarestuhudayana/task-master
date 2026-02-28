import type { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import { AppError } from "../utils/AppError.js"
import { logger } from "../lib/logger.js"

export function errorHandler(err: Error | AppError | ZodError, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ZodError) {
        res.status(400).json({ error: err.issues })
        return
    }

    if (err instanceof AppError) {
        if (err.isOperational) {
            res.status(err.statusCode).json({
                error: err.message,
                details: err.errors,
            })
            return
        }
    }

    // Handle Postgres Specific Errors
    if (typeof err === "object" && err !== null && "code" in err) {
        const pgError = err as any;

        // Unique violation
        if (pgError.code === "23505") {
            res.status(409).json({
                error: "Resource already exists",
                message: pgError.detail || "A record with this unique value already exists."
            })
            return
        }

        // Foreign key violation
        if (pgError.code === "23503") {
            res.status(400).json({
                error: "Invalid reference",
                message: pgError.detail || "Referenced record does not exist."
            })
            return
        }
    }

    logger.error("Unhandled Exception", err)

    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
    })
}
