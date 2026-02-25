import type { Request, Response, NextFunction } from "express"
import { ZodError, ZodTypeAny } from "zod"

export const validateBody = (schema: ZodTypeAny) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync(req.body)
            req.body = parsed
            next()
        } catch (error) {
            next(error)
        }
    }
}

export const validateQuery = (schema: ZodTypeAny) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync(req.query)
            req.query = parsed as any
            next()
        } catch (error) {
            next(error)
        }
    }
}

export const validateParams = (schema: ZodTypeAny) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync(req.params)
            req.params = parsed as any
            next()
        } catch (error) {
            next(error)
        }
    }
}
