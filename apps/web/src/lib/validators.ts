import { z } from "zod"

// Auth
export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})
export type LoginValues = z.infer<typeof loginSchema>

export const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})
export type SignupValues = z.infer<typeof signupSchema>

// Workspace
export const createWorkspaceSchema = z.object({
    name: z.string().min(2, "Workspace name must be at least 2 characters").max(50),
    description: z.string().max(200).optional(),
})
export type CreateWorkspaceValues = z.infer<typeof createWorkspaceSchema>

// Task
export const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().optional(),
    columnId: z.string(),
})
export type CreateTaskValues = z.infer<typeof createTaskSchema>

// Settings
export const profileSchema = z.object({
    displayName: z.string().min(2, "Display name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    image: z.string().url("Invalid image URL").nullish().or(z.literal("")),
})
export type ProfileValues = z.infer<typeof profileSchema>

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "New password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>

// Invite member
export const inviteMemberSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
})
export type InviteMemberValues = z.infer<typeof inviteMemberSchema>

// Password Reset
export const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
})
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

// Board
export const createBoardSchema = z.object({
    name: z.string().min(2, "Board name must be at least 2 characters").max(50),
    color: z.string().optional(),
})
export type CreateBoardValues = z.infer<typeof createBoardSchema>
export const updateBoardSchema = createBoardSchema
export type UpdateBoardValues = CreateBoardValues
