import { useEffect, useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { CheckCircle2, XCircle, ArrowRight, Mail } from "lucide-react"
import { useVerifyEmail } from "@/hooks/use-auth"

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get("token")
    const verifyEmail = useVerifyEmail()
    const [verifying, setVerifying] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setError("Missing verification token.")
            setVerifying(false)
            return
        }

        const doVerify = async () => {
            try {
                await verifyEmail.mutateAsync(token)
                setSuccess(true)
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to verify email. The link may have expired.")
            } finally {
                setVerifying(false)
            }
        }

        doVerify()
    }, [token])

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0d1117] p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#161b22] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                {verifying ? (
                    <div className="flex flex-col items-center gap-6 py-8">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <Mail className="absolute inset-0 m-auto h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verifying your email</h1>
                            <p className="text-slate-500 dark:text-slate-400">Please wait while we confirm your account...</p>
                        </div>
                    </div>
                ) : success ? (
                    <div className="flex flex-col items-center gap-6 py-4">
                        <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-in zoom-in duration-500">
                            <CheckCircle2 size={48} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Email Verified!</h1>
                            <p className="text-slate-500 dark:text-slate-400">Your account is now fully active. You can start managing your projects.</p>
                        </div>
                        <Link
                            to="/dashboard"
                            className="group mt-4 w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25"
                        >
                            Go to Dashboard
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6 py-4">
                        <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 animate-in zoom-in duration-500">
                            <XCircle size={48} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verification Failed</h1>
                            <p className="text-slate-500 dark:text-slate-400">{error || "Something went wrong during verification."}</p>
                        </div>
                        <div className="flex flex-col gap-3 w-full mt-4">
                            <Link
                                to="/login"
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-all"
                            >
                                Back to Login
                            </Link>
                            <button
                                onClick={() => navigate(0)}
                                className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
