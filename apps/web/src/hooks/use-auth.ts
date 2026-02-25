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

export function useLogin() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (body: { email: string; password: string }) => {
            const { data } = await api.post("/auth/sign-in/email", body)
            return data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["auth"] })
            qc.invalidateQueries({ queryKey: ["workspaces"] })
            qc.invalidateQueries({ queryKey: ["boards"] })
            qc.invalidateQueries({ queryKey: ["activity"] })
        },
    })
}

export function useSignup() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (body: { name: string; email: string; password: string }) => {
            const { data } = await api.post("/auth/sign-up/email", body)
            return data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["auth"] })
            qc.invalidateQueries({ queryKey: ["workspaces"] })
            qc.invalidateQueries({ queryKey: ["boards"] })
            qc.invalidateQueries({ queryKey: ["activity"] })
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

export function useVerifyEmail() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (token: string) => {
            const { data } = await api.get(`/auth/verify-email?token=${token}`)
            return data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["auth"] })
        },
    })
}

export function useForgotPassword() {
    return useMutation({
        mutationFn: async (email: string) => {
            await api.post("/auth/request-password-reset", { email, redirectTo: "/reset-password" })
        },
    })
}

export function useResetPassword() {
    return useMutation({
        mutationFn: async ({ password, token }: { password: string; token: string }) => {
            await api.post("/auth/reset-password", { newPassword: password, token })
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

export function useChangePassword() {
    return useMutation({
        mutationFn: async (body: { currentPassword: string; newPassword: string }) => {
            const { data } = await api.post("/auth/change-password", body)
            return data
        },
    })
}
