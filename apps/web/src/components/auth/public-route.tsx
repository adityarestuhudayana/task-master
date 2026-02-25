import { Navigate, Outlet } from "react-router-dom"
import { useCurrentUser } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export function PublicRoute() {
    const { data: user, isLoading } = useCurrentUser()

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        )
    }

    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}
