import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useWorkspaces() {
    return useQuery({
        queryKey: ["workspaces"],
        queryFn: async () => {
            const { data } = await api.get("/workspaces")
            return data
        },
    })
}

export function useCreateWorkspace() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (body: { name: string; description?: string }) => {
            const { data } = await api.post("/workspaces", body)
            return data
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workspaces"] }),
    })
}

export function useUpdateWorkspace() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...body }: { id: string; name?: string; description?: string }) => {
            const { data } = await api.patch(`/workspaces/${id}`, body)
            return data
        },
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ["workspaces"] })
            qc.invalidateQueries({ queryKey: ["workspaces", data.id] })
        },
    })
}

export function useDeleteWorkspace() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/workspaces/${id}`)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["workspaces"] })
        },
    })
}

export function useInviteMember(workspaceId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (body: { email: string }) => {
            const { data } = await api.post(`/workspaces/${workspaceId}/invite`, body)
            return data
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workspaces", workspaceId, "members"] }),
    })
}

export function useWorkspaceMembers(workspaceId: string) {
    return useQuery({
        queryKey: ["workspaces", workspaceId, "members"],
        queryFn: async () => {
            const { data } = await api.get(`/workspaces/${workspaceId}/members`)
            return data
        },
        enabled: !!workspaceId,
    })
}

export function useWorkspaceLabels(workspaceId: string) {
    return useQuery({
        queryKey: ["workspaces", workspaceId, "labels"],
        queryFn: async () => {
            const { data } = await api.get(`/workspaces/${workspaceId}/labels`)
            return data
        },
        enabled: !!workspaceId,
    })
}

export function useCreateLabel(workspaceId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (body: { name: string; color: string }) => {
            const { data } = await api.post(`/workspaces/${workspaceId}/labels`, body)
            return data
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workspaces", workspaceId, "labels"] }),
    })
}
