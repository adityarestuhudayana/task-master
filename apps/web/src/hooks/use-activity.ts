import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useActivity(limit = 10, workspaceId?: string) {
    return useQuery({
        queryKey: ["activity", { limit, workspaceId }],
        queryFn: async () => {
            const params = new URLSearchParams({ limit: String(limit) })
            if (workspaceId) params.set("workspaceId", workspaceId)
            const { data } = await api.get(`/activity?${params}`)
            return data
        },
    })
}
