import { useState } from "react"
import { Filter, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Member } from "@/types"
import { UserAvatar } from "../common/user-avatar"

interface BoardFiltersProps {
    members: Member[]
    labels: Array<{ id: string; name: string; color: string }>
    filters: {
        assigneeIds: string[]
        labelIds: string[]
        hideCompleted: boolean
    }
    onChange: (filters: {
        assigneeIds: string[]
        labelIds: string[]
        hideCompleted: boolean
    }) => void
}

export function BoardFilters({ members, labels, filters, onChange }: BoardFiltersProps) {
    const [isOpen, setIsOpen] = useState(false)

    const activeCount = filters.assigneeIds.length + filters.labelIds.length + (filters.hideCompleted ? 1 : 0)

    const toggleAssignee = (id: string) => {
        const newIds = filters.assigneeIds.includes(id)
            ? filters.assigneeIds.filter((i) => i !== id)
            : [...filters.assigneeIds, id]
        onChange({ ...filters, assigneeIds: newIds })
    }

    const toggleLabel = (id: string) => {
        const newIds = filters.labelIds.includes(id)
            ? filters.labelIds.filter((i) => i !== id)
            : [...filters.labelIds, id]
        onChange({ ...filters, labelIds: newIds })
    }

    const clearAll = () => {
        onChange({
            assigneeIds: [],
            labelIds: [],
            hideCompleted: false,
        })
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-colors py-2 px-3 rounded-lg border",
                    activeCount > 0
                        ? "bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
            >
                <div className="relative">
                    <Filter size={18} />
                    {activeCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                            {activeCount}
                        </span>
                    )}
                </div>
                Filter
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 z-50 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Filter Tasks
                            </h3>
                            {activeCount > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest transition-colors"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar p-4 space-y-5">
                            {/* Hide Completed */}
                            <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange({ ...filters, hideCompleted: !filters.hideCompleted })}>
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Hide Completed</span>
                                <div className={cn(
                                    "w-8 h-4 rounded-full transition-colors relative",
                                    filters.hideCompleted ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                                )}>
                                    <div className={cn(
                                        "absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform",
                                        filters.hideCompleted && "translate-x-4"
                                    )} />
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-700" />

                            {/* Assignees */}
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assignees</h4>
                                <div className="space-y-1">
                                    {members.map((member) => (
                                        <button
                                            key={member.id}
                                            onClick={() => toggleAssignee(member.id)}
                                            className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <UserAvatar
                                                    name={member.name}
                                                    initials={member.initials}
                                                    avatarUrl={member.avatarUrl}
                                                    color={member.color}
                                                    size="sm"
                                                />
                                                <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                                                    {member.name}
                                                </span>
                                            </div>
                                            {filters.assigneeIds.includes(member.id) && (
                                                <Check size={14} className="text-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Labels */}
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Labels</h4>
                                <div className="space-y-1">
                                    {labels.map((label) => (
                                        <button
                                            key={label.id}
                                            onClick={() => toggleLabel(label.id)}
                                            className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={cn("w-2 h-2 rounded-full", `bg-${label.color}-500`)} />
                                                <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                                                    {label.name}
                                                </span>
                                            </div>
                                            {filters.labelIds.includes(label.id) && (
                                                <Check size={14} className="text-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
