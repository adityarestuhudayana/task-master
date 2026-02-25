import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { inviteMemberSchema, type InviteMemberValues, createWorkspaceSchema, type CreateWorkspaceValues } from "@/lib/validators"
import { useWorkspaceMembers, useWorkspaces, useUpdateWorkspace, useDeleteWorkspace } from "@/hooks/use-workspaces"
import { useUIStore } from "@/stores/ui-store"
import { X, Settings as SettingsIcon } from "lucide-react"

export function WorkspaceSettingsModal() {
    const { workspaceSettingsOpen, workspaceSettingsId, closeWorkspaceSettings } = useUIStore()
    const { data: workspaces = [] } = useWorkspaces()
    const { data: members = [] } = useWorkspaceMembers(workspaceSettingsId || "")
    const updateWorkspace = useUpdateWorkspace()
    const deleteWorkspace = useDeleteWorkspace()
    const navigate = useNavigate()

    const currentWorkspace = workspaces.find((w: any) => w.id === workspaceSettingsId)

    const {
    } = useForm<InviteMemberValues>({
        resolver: zodResolver(inviteMemberSchema),
    })

    const {
        register: registerGeneral,
        handleSubmit: handleSubmitGeneral,
        formState: { errors: errorsGeneral, isSubmitting: isUpdating },
    } = useForm<CreateWorkspaceValues>({
        resolver: zodResolver(createWorkspaceSchema),
        values: {
            name: currentWorkspace?.name || "",
            description: currentWorkspace?.description || "",
        }
    })



    const onUpdateGeneral = async (data: CreateWorkspaceValues) => {
        if (!workspaceSettingsId) return
        try {
            await updateWorkspace.mutateAsync({ id: workspaceSettingsId, ...data })
            closeWorkspaceSettings()
        } catch {
            // Error handled by mutation
        }
    }

    const onDeleteWorkspace = async () => {
        if (!workspaceSettingsId) return
        const confirmed = window.confirm(
            "Are you sure you want to delete this workspace? All boards and data inside will be permanently removed."
        )

        if (confirmed) {
            try {
                await deleteWorkspace.mutateAsync(workspaceSettingsId)
                closeWorkspaceSettings()
                navigate("/dashboard")
            } catch {
                // Error handled by mutation
            }
        }
    }

    if (!workspaceSettingsOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeWorkspaceSettings}
            />
            <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <SettingsIcon size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Workspace Settings
                            </h2>
                            <p className="text-xs text-slate-500">
                                Manage details, members and permissions
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={closeWorkspaceSettings}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* General Settings */}
                    <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-700 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            General Settings
                        </h3>
                        <form onSubmit={handleSubmitGeneral(onUpdateGeneral)} className="space-y-4">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Workspace Name
                                </span>
                                <input
                                    {...registerGeneral("name")}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition"
                                />
                                {errorsGeneral.name && (
                                    <span className="text-xs text-red-500">{errorsGeneral.name.message}</span>
                                )}
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Description
                                </span>
                                <textarea
                                    {...registerGeneral("description")}
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                                />
                            </label>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Members List */}
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                            Members ({members.length})
                        </h3>
                        <div className="space-y-1">
                            {members.map((member: { id: string; name: string; email: string; role: string }) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                            {member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-slate-500">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                            {member.role}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="px-6 py-6 space-y-4">
                        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                            Danger Zone
                        </h3>
                        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold text-red-900 dark:text-red-200">
                                    Delete Workspace
                                </p>
                                <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
                                    This action is permanent and cannot be undone.
                                </p>
                            </div>
                            <button
                                onClick={onDeleteWorkspace}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button
                        onClick={closeWorkspaceSettings}
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
