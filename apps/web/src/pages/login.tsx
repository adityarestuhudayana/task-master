import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginValues } from "@/lib/validators"
import { useLogin } from "@/hooks/use-auth"
import { useState } from "react"
import { Mail, Lock, ArrowRight, CheckSquare, AlertCircle } from "lucide-react"

export function LoginPage() {
    const navigate = useNavigate()
    const login = useLogin()
    const [apiError, setApiError] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginValues) => {
        setApiError("")
        try {
            await login.mutateAsync(data)
            navigate("/dashboard")
        } catch (err: any) {
            if (err.response?.data?.code === "EMAIL_NOT_VERIFIED") {
                setApiError("Your email has not been verified yet. Please check your inbox.")
            } else {
                setApiError("Invalid email or password")
            }
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

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {apiError && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                            {apiError}
                        </div>
                    )}
                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Email address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={18} className="text-slate-400" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                {...register("email")}
                                placeholder="name@company.com"
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Password
                            </label>
                            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-blue-600 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-slate-400" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                {...register("password")}
                                placeholder="••••••••"
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
                            />
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50"
                        >
                            Log In
                            <ArrowRight size={16} className="ml-2" />
                        </button>
                    </div>
                </form>

                {/* Sign Up Link */}
                <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                    Don't have an account?{" "}
                    <Link to="/signup" className="font-semibold text-primary hover:text-blue-600 hover:underline transition-colors">
                        Sign up
                    </Link>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex gap-3 items-start">
                    <AlertCircle size={18} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Butuh Akun Demo?</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            Gunakan <span className="font-semibold text-slate-800 dark:text-slate-200">budi@indo.com</span> dengan password <span className="font-semibold text-slate-800 dark:text-slate-200">password123</span> untuk login instan.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
