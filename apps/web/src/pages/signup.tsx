import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, type SignupValues } from "@/lib/validators"
import { useSignup } from "@/hooks/use-auth"
import { useState, useEffect } from "react"
import { Eye, EyeOff, CheckCircle, Mail, AlertCircle } from "lucide-react"
import { useSearchParams } from "react-router-dom"

export function SignupPage() {
    const signup = useSignup()
    const [showPassword, setShowPassword] = useState(false)
    const [apiError, setApiError] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)
    const [searchParams] = useSearchParams()
    const invitedEmail = searchParams.get("email")
    const isInvited = !!searchParams.get("token")

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: invitedEmail || "",
        },
    })

    // Pre-fill email if it changes in URL
    useEffect(() => {
        if (invitedEmail) {
            setValue("email", invitedEmail)
        }
    }, [invitedEmail, setValue])

    const onSubmit = async (data: SignupValues) => {
        setApiError("")
        try {
            await signup.mutateAsync(data)
            // If email verification is enabled, the sign-up succeeds but doesn't return a session
            setIsSuccess(true)
        } catch (err: any) {
            if (err.response?.status === 422 && (err.response?.data?.code === "USER_ALREADY_EXISTS" || err.response?.data?.message?.includes("already exists"))) {
                setApiError("user with this email already exists")
            } else {
                setApiError("Failed to create account. Please check your details and try again.")
            }
        }
    }

    if (isSuccess) {
        return (
            <div className="w-full max-w-[480px] rounded-xl bg-white dark:bg-slate-800 shadow-lg p-8 sm:p-12 text-center">
                <div className="flex flex-col items-center gap-6 py-4">
                    <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 animate-in zoom-in duration-500">
                        <Mail size={48} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            We've sent a verification link to your email address. Please click the link to activate your account.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full mt-4">
                        <Link
                            to="/login"
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-all"
                        >
                            Back to Login
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Didn't receive an email? Check your spam folder or wait a few minutes.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-[480px] rounded-xl bg-white dark:bg-slate-800 shadow-lg p-8 sm:p-12">
            {/* Logo / Header */}
            <div className="flex flex-col items-center mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={32} className="text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        TaskMaster
                    </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    {isInvited ? "Finish setting up your account to join the workspace" : "Create your account to get started"}
                </p>
            </div>

            {isInvited && (
                <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-primary">
                        <Mail size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">Workspace Invitation</h3>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                            We've pre-filled your email. Just choose a password to continue.
                        </p>
                    </div>
                </div>
            )}

            {!isSuccess && (
                <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 flex gap-3">
                    <div className="shrink-0 text-amber-600 dark:text-amber-500 mt-0.5">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">Pendaftaran Terbatas</h3>
                        <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1 leading-relaxed">
                            Sign-up memerlukan verifikasi email (SMTP). Jika tidak aktif, gunakan akun demo:
                            <span className="block mt-1 font-mono bg-amber-100/50 dark:bg-amber-900/30 px-1 py-0.5 rounded text-[10px]">
                                budi@indo.com (PW: password123)
                            </span>
                        </p>
                    </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {apiError && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                        {apiError}
                    </div>
                )}
                {/* Full Name */}
                <label className="flex flex-col gap-1.5">
                    <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">Full Name</span>
                    <input
                        type="text"
                        {...register("name")}
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                    />
                    {errors.name && (
                        <span className="text-xs text-red-500">{errors.name.message}</span>
                    )}
                </label>

                {/* Email */}
                <label className="flex flex-col gap-1.5">
                    <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">Email Address</span>
                    <input
                        type="email"
                        autoComplete="email"
                        {...register("email")}
                        placeholder="name@company.com"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                    />
                    {errors.email && (
                        <span className="text-xs text-red-500">{errors.email.message}</span>
                    )}
                </label>

                {/* Password */}
                <label className="flex flex-col gap-1.5">
                    <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">Password</span>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && (
                        <span className="text-xs text-red-500">{errors.password.message}</span>
                    )}
                </label>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-lg bg-primary py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-50"
                >
                    Create Account
                </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-primary hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}
