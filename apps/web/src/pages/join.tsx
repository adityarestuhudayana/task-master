import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useJoinWorkspace } from "@/hooks/use-workspaces"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

export function JoinWorkspacePage() {
    const { inviteCode } = useParams<{ inviteCode: string }>()
    const navigate = useNavigate()
    const joinWorkspace = useJoinWorkspace()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        if (!inviteCode) {
            setStatus("error")
            setErrorMessage("Invalid invite link")
            return
        }

        const join = async () => {
            try {
                const res = await joinWorkspace.mutateAsync(inviteCode)
                setStatus("success")
                setTimeout(() => {
                    navigate(`/w/${res.workspaceId}`)
                }, 2000)
            } catch (error: any) {
                setStatus("error")
                setErrorMessage(
                    error.response?.data?.message || "Failed to join workspace. The link might be invalid or expired."
                )
            }
        }

        join()
    }, [inviteCode]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="flex bg-slate-50 dark:bg-slate-900 flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden text-center p-8 border border-slate-200 dark:border-slate-700">

                {status === "loading" && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                            <Loader2 size={32} className="text-primary animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Joining Workspace...</h1>
                        <p className="text-slate-500 dark:text-slate-400">Please wait while we set things up for you.</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-6">
                            <CheckCircle2 size={32} className="text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Successfully Joined!</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Redirecting you to the workspace...</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-6">
                            <XCircle size={32} className="text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Oh no!</h1>
                        <p className="text-red-500 dark:text-red-400 font-medium mb-6">{errorMessage}</p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="w-full py-3 px-4 bg-primary hover:bg-blue-600 text-white rounded-lg font-bold transition-colors shadow-sm"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
