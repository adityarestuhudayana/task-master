import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useNotifications() {
    return useInfiniteQuery({
        queryKey: ["notifications"],
        queryFn: async ({ pageParam }) => {
            const url = pageParam ? `/notifications?cursor=${pageParam}` : "/notifications"
            const { data } = await api.get(url)
            return data
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
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
