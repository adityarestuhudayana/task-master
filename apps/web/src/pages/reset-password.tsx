import { Link, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validators"
import { useResetPassword } from "@/hooks/use-auth"
import { useState, useEffect } from "react"
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react"

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")
    const resetPassword = useResetPassword()
    const [showPassword, setShowPassword] = useState(false)
    const [apiError, setApiError] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setApiError("Invalid or missing reset token.")
        }
    }, [token])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
    })

    const onSubmit = async (data: ResetPasswordValues) => {
        if (!token) return
        setApiError("")
        try {
            await resetPassword.mutateAsync({ password: data.password, token })
            setIsSuccess(true)
        } catch (err: any) {
            setApiError(err.response?.data?.message || "Failed to reset password. The link may have expired.")
        }
    }

    if (isSuccess) {
        return (
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500" />
                <div className="p-8 sm:p-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Password Reset Successful</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                        Your password has been changed successfully. You can now use your new password to log in to your account.
                    </p>
                    <Link
                        to="/login"
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-blue-600 transition-colors"
                    >
                        Go to Login
                        <ArrowRight size={16} className="ml-2" />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-blue-400" />

            <div className="p-8 sm:p-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        Create New Password
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Please enter a strong password for your account
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {apiError && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                            {apiError}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            New Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-slate-400" />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                placeholder="••••••••"
                                className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-slate-400" />
                            </div>
                            <input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                {...register("confirmPassword")}
                                placeholder="••••••••"
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
                            />
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !token}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50"
                    >
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    )
}
