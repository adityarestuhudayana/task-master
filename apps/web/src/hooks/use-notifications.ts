import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useNotifications() {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const { data } = await api.get("/notifications")
            return data
        },
        refetchInterval: 30000, // Refetch every 30s
    })
}

export function useMarkNotificationRead() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/notifications/${id}/read`)
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    })
}

export function useMarkAllNotificationsRead() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            await api.post("/notifications/read-all")
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    })
}
