import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useComments(taskId: string) {
    return useQuery({
        queryKey: ["comments", taskId],
        queryFn: async () => {
            const { data } = await api.get(`/tasks/${taskId}/comments`)
            return data
        },
        enabled: !!taskId,
    })
}

export function useCreateComment(taskId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (body: { content: string }) => {
            const { data } = await api.post(`/tasks/${taskId}/comments`, body)
            return data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["comments", taskId] })
            qc.invalidateQueries({ queryKey: ["activity"] })
        },
    })
}
