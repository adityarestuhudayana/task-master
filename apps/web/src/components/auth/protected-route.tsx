import { Navigate, Outlet } from "react-router-dom"
import { useCurrentUser } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export function ProtectedRoute() {
    const { data: user, isLoading } = useCurrentUser()

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
                        Setting up your workspace...
                    </p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
