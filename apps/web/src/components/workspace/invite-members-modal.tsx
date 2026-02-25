import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { inviteMemberSchema, type InviteMemberValues } from "@/lib/validators"
import { useWorkspaceMembers, useInviteMember, useWorkspaces } from "@/hooks/use-workspaces"
import { useUIStore } from "@/stores/ui-store"
import { X, UserPlus, Send, Mail } from "lucide-react"
import { UserAvatar } from "../common/user-avatar"
import { getUserColor } from "@/lib/utils"

export function InviteMembersModal() {
    const { inviteMembersOpen, inviteMembersId, closeInviteMembers } = useUIStore()
    const { data: workspaces = [] } = useWorkspaces()
    const { data: members = [] } = useWorkspaceMembers(inviteMembersId || "")
    const inviteMember = useInviteMember(inviteMembersId || "")

    const currentWorkspace = workspaces.find((w: any) => w.id === inviteMembersId)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<InviteMemberValues>({
        resolver: zodResolver(inviteMemberSchema),
    })

    const onInvite = async (data: InviteMemberValues) => {
        try {
            await inviteMember.mutateAsync(data)
            reset()
        } catch {
            // Error handled by mutation
        }
    }

    if (!inviteMembersOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeInviteMembers}
            />
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 md:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 md:relative absolute bottom-0 md:bottom-auto max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 md:px-6 py-4 md:py-4 border-b border-slate-100 dark:border-slate-700 flex-none">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            <UserPlus className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                Workspace Settings
                            </h2>
                            <p className="text-[10px] md:text-xs text-slate-500">
                                {currentWorkspace?.name || "Workspace"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={closeInviteMembers}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="px-5 md:px-6 py-5 md:py-6 space-y-5 md:space-y-6">
                        {/* Invite Section */}
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white mb-0.5">
                                    Invite Members
                                </h3>
                                <p className="text-[11px] md:text-xs text-slate-500">
                                    Add new members by email address.
                                </p>
                            </div>
                            <form onSubmit={handleSubmit(onInvite)} className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        {...register("email")}
                                        placeholder="name@company.com"
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                                    />
                                    {errors.email && (
                                        <span className="absolute -bottom-4 left-0 text-[9px] text-red-500 font-medium">
                                            {errors.email.message}
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-1.5 group whitespace-nowrap"
                                >
                                    Invite
                                    <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </button>
                            </form>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-700" />

                        {/* Members List */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                                    Active Members
                                </h3>
                                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] md:text-[10px] font-bold rounded-full">
                                    {members.length}
                                </span>
                            </div>
                            <div className="space-y-1">
                                {members.map((member: { id: string; name: string; email: string; role: string; image?: string | null }) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between py-1.5 md:py-2 px-2 md:px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <UserAvatar
                                                name={member.name}
                                                initials={member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                                                avatarUrl={member.image || undefined}
                                                color={getUserColor(member.name)}
                                                size="md"
                                                className="ring-2 ring-white dark:ring-slate-800 shadow-sm"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {member.name}
                                                </p>
                                                <p className="text-[10px] md:text-[11px] text-slate-500 font-medium truncate">{member.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {members.length === 0 && (
                                    <p className="text-center py-6 text-xs text-slate-400 italic">No members found</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 md:px-6 py-4 md:py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end flex-none">
                    <button
                        onClick={closeInviteMembers}
                        className="w-full sm:w-auto px-5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
