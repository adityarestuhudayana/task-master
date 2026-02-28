import { useNavigate } from "react-router-dom"
import { useGoogleLogin } from "@/hooks/use-auth"
import { useState } from "react"
import { CheckSquare, LogIn } from "lucide-react"

export function LoginPage() {
    const navigate = useNavigate()
    const googleLogin = useGoogleLogin()
    const [apiError, setApiError] = useState("")

    const onGoogleLogin = async () => {
        setApiError("")
        try {
            await googleLogin.mutateAsync()
        } catch (err: any) {
            setApiError("Failed to login with Google. Please try again.")
        }
    }

    return (
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative">
            {/* Decorative top accent */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-blue-400" />

            <div className="p-8 sm:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                        <CheckSquare size={24} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        TaskMaster
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Welcome back to your workspace
                    </p>
                </div>

                {/* Main Auth Action */}
                <div className="space-y-4">
                    {apiError && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                            {apiError}
                        </div>
                    )}

                    <button
                        onClick={onGoogleLogin}
                        disabled={googleLogin.isPending}
                        className="w-full flex justify-center items-center py-3 px-4 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm text-sm font-bold text-slate-700 dark:text-white bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                            <path fill="none" d="M1 1h22v22H1z" />
                        </svg>
                        Continue with Google
                    </button>
                </div>
            </div>

            <div className="h-2 bg-slate-50 dark:bg-slate-900 w-full border-t border-slate-100 dark:border-slate-700" />
        </div>
    )
}
