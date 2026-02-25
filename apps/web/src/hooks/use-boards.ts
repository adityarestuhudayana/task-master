import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useBoards(workspaceId?: string) {
    return useQuery({
        queryKey: ["boards", { workspaceId }],
        queryFn: async () => {
            if (!workspaceId) {
                // Fetch all boards across workspaces for the dashboard
                const { data: workspaces } = await api.get("/workspaces")
                const allBoards = await Promise.all(
                    workspaces.map(async (ws: { id: string }) => {
                        const { data: boards } = await api.get(`/workspaces/${ws.id}/boards`)
                        return boards
                    }),
                )
                return allBoards.flat()
            }
            const { data } = await api.get(`/workspaces/${workspaceId}/boards`)
            return data
        },
    })
}

export function useBoard(boardId: string) {
    return useQuery({
        queryKey: ["board", boardId],
        queryFn: async () => {
            const { data } = await api.get(`/boards/${boardId}`)
            return data
        },
        enabled: !!boardId,
    })
}

export function useCreateBoard(workspaceId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (body: { name: string; color?: string }) => {
            const { data } = await api.post(`/workspaces/${workspaceId}/boards`, body)
            return data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["boards"] })
            qc.invalidateQueries({ queryKey: ["auth", "dashboard"] })
        },
    })
}

export function useUpdateBoard(workspaceId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...body }: { id: string; name?: string; color?: string }) => {
            const { data } = await api.patch(`/boards/${id}`, body)
            return data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["boards", { workspaceId }] })
            qc.invalidateQueries({ queryKey: ["board"] })
            qc.invalidateQueries({ queryKey: ["auth", "dashboard"] })
        },
    })
}

export function useDeleteBoard(workspaceId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/boards/${id}`)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["boards", { workspaceId }] })
            qc.invalidateQueries({ queryKey: ["auth", "dashboard"] })
        },
    })
}
