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

    logger.error("Unhandled Exception", err)

    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
    })
}
