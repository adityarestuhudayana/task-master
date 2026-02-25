import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validators"
import { useForgotPassword } from "@/hooks/use-auth"
import { useState } from "react"
import { Mail, ArrowLeft, Key } from "lucide-react"

export function ForgotPasswordPage() {
    const forgotPassword = useForgotPassword()
    const [apiError, setApiError] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordValues) => {
        setApiError("")
        try {
            await forgotPassword.mutateAsync(data.email)
            setIsSuccess(true)
        } catch (err: any) {
            setApiError("Something went wrong. Please try again.")
        }
    }

    if (isSuccess) {
        return (
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-blue-400" />
                <div className="p-8 sm:p-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                        We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center text-sm font-semibold text-primary hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back to login
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
                        <Key size={24} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        Reset Password
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Enter your email and we'll send you a link to reset your password
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {apiError && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                            {apiError}
                        </div>
                    )}

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

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50"
                    >
                        {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-700 pt-6">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    )
}
