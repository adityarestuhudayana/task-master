import { z } from "zod"

export const updateUserProfileSchema = z.object({
    displayName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    image: z.string().url().nullish().or(z.literal("")),
})

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
