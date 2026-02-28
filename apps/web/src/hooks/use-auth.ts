import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useCurrentUser() {
    return useQuery({
        queryKey: ["auth", "me"],
        queryFn: async () => {
            const { data } = await api.get("/auth/get-session")
            return data?.user ?? null
        },
        retry: false,
        staleTime: 0,
    })
}

export function useDashboardData() {
    return useQuery({
        queryKey: ["auth", "dashboard"],
        queryFn: async () => {
            const { data } = await api.get("/users/me/dashboard")
            return data
        },
        retry: false,
        staleTime: 1000 * 60, // 1 minute
    })
}

export function useGoogleLogin() {
    return useMutation({
        mutationFn: async (callbackURL?: string) => {
            const { data } = await api.post("/auth/sign-in/social", {
                provider: "google",
                callbackURL: callbackURL || `${window.location.origin}/dashboard`
            })
            if (data?.url) {
                window.location.href = data.url
            }
            return data
        },
    })
}

export function useLogout() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            await api.post("/auth/sign-out")
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["auth"] })
            qc.invalidateQueries({ queryKey: ["workspaces"] })
            qc.invalidateQueries({ queryKey: ["boards"] })
            qc.invalidateQueries({ queryKey: ["activity"] })
        },
    })
}

export function useUpdateProfile() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (body: { displayName?: string; email?: string; image?: string | null }) => {
            const { data } = await api.patch("/users/me", body)
            return data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["auth"] })
            qc.invalidateQueries({ queryKey: ["workspaces"] })
            qc.invalidateQueries({ queryKey: ["boards"] })
            qc.invalidateQueries({ queryKey: ["board"] })
        },
    })
}
