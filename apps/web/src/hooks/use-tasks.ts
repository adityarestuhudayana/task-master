import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useCreateTask(boardId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (body: {
            columnId: string
            title: string
            description?: string
            assigneeIds?: string[]
            labelIds?: string[]
            dueDate?: string
        }) => {
            const { columnId, ...rest } = body
            const { data } = await api.post(`/columns/${columnId}/tasks`, rest)
            return data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["board", boardId] })
            qc.invalidateQueries({ queryKey: ["activity"] })
            qc.invalidateQueries({ queryKey: ["auth", "dashboard"] })
        },
    })
}

export function useTask(taskId: string) {
    return useQuery({
        queryKey: ["task", taskId],
        queryFn: async () => {
            const { data } = await api.get(`/tasks/${taskId}`)
            return data
        },
        enabled: !!taskId,
    })
}

export function useUpdateTask(boardId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ taskId, ...body }: { taskId: string;[key: string]: unknown }) => {
            const { data } = await api.patch(`/tasks/${taskId}`, body)
            return data
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ["board", boardId] })
            qc.invalidateQueries({ queryKey: ["task", variables.taskId] })
            qc.invalidateQueries({ queryKey: ["activity"] })
            qc.invalidateQueries({ queryKey: ["auth", "dashboard"] })
        },
    })
}

export function useMoveTask(boardId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (body: { taskId: string; columnId: string; position: number }) => {
            const { taskId, ...rest } = body
            const { data } = await api.patch(`/tasks/${taskId}/move`, rest)
            return data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["board", boardId] })
            qc.invalidateQueries({ queryKey: ["activity"] })
            qc.invalidateQueries({ queryKey: ["auth", "dashboard"] })
        },
    })
}

export function useDeleteTask(boardId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (taskId: string) => {
            await api.delete(`/tasks/${taskId}`)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["board", boardId] })
            qc.invalidateQueries({ queryKey: ["activity"] })
            qc.invalidateQueries({ queryKey: ["auth", "dashboard"] })
        },
    })
}

export function useAddTaskAssignee(boardId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
            const { data } = await api.post(`/tasks/${taskId}/assignees`, { userId })
            return data
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ["board", boardId] })
            qc.invalidateQueries({ queryKey: ["task", variables.taskId] })
            qc.invalidateQueries({ queryKey: ["auth", "dashboard"] })
        },
    })
}

export function useAddTaskLabel(boardId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ taskId, labelId }: { taskId: string; labelId: string }) => {
            const { data } = await api.post(`/tasks/${taskId}/labels`, { labelId })
            return data
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ["board", boardId] })
            qc.invalidateQueries({ queryKey: ["task", variables.taskId] })
            qc.invalidateQueries({ queryKey: ["auth", "dashboard"] })
        },
    })
}

export function useRemoveTaskAssignee(boardId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
            await api.delete(`/tasks/${taskId}/assignees/${userId}`)
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ["board", boardId] })
            qc.invalidateQueries({ queryKey: ["task", variables.taskId] })
            qc.invalidateQueries({ queryKey: ["auth", "dashboard"] })
        },
    })
}

export function useRemoveTaskLabel(boardId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ taskId, labelId }: { taskId: string; labelId: string }) => {
            await api.delete(`/tasks/${taskId}/labels/${labelId}`)
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ["board", boardId] })
            qc.invalidateQueries({ queryKey: ["task", variables.taskId] })
            qc.invalidateQueries({ queryKey: ["auth", "dashboard"] })
        },
    })
}
