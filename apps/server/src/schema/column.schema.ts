import { z } from "zod"

export const createColumnSchema = z.object({
    name: z.string().min(1).max(100),
    color: z.string().optional(),
})

export const updateColumnSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    color: z.string().optional(),
    position: z.number().int().min(0).optional(),
})

export type CreateColumnInput = z.infer<typeof createColumnSchema>
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>
