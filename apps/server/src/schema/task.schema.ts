import { z } from "zod"

export const createTaskSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    assigneeIds: z.array(z.string()).optional(),
    labelIds: z.array(z.string().uuid()).optional(),
    dueDate: z.string().optional(),
})

export const updateTaskSchema = z.object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
    completed: z.boolean().optional(),
    flagged: z.boolean().optional(),
    position: z.number().int().min(0).optional(),
    columnId: z.string().uuid().optional(),
})

export const moveTaskSchema = z.object({
    columnId: z.string().uuid(),
    position: z.number().int().min(0),
})

export const addTaskAssigneeSchema = z.object({
    userId: z.string()
})

export const addTaskLabelSchema = z.object({
    labelId: z.string().uuid()
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type MoveTaskInput = z.infer<typeof moveTaskSchema>
export type AddTaskAssigneeInput = z.infer<typeof addTaskAssigneeSchema>
export type AddTaskLabelInput = z.infer<typeof addTaskLabelSchema>
