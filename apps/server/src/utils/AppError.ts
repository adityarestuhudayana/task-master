import { ZodError } from "zod"

export class AppError extends Error {
    public readonly statusCode: number
    public readonly isOperational: boolean
    public readonly errors?: any

    constructor(message: string, statusCode: number, isOperational = true, errors?: any) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)

        this.statusCode = statusCode
        this.isOperational = isOperational
        this.errors = errors
        Error.captureStackTrace(this)
    }

    static badRequest(message: string) {
        return new AppError(message, 400)
    }

    static unauthorized(message: string) {
        return new AppError(message, 401)
    }

    static forbidden(message: string) {
        return new AppError(message, 403)
    }

    static notFound(message: string) {
        return new AppError(message, 404)
    }

    static conflict(message: string) {
        return new AppError(message, 409)
    }

    static internal(message = "Internal Server Error") {
        return new AppError(message, 500, false)
    }
}
