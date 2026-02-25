import { useState } from "react"
import { useParams } from "react-router-dom"
import { useUIStore } from "@/stores/ui-store"
import { useCreateTask } from "@/hooks/use-tasks"
import { useWorkspaceMembers, useWorkspaceLabels, useCreateLabel } from "@/hooks/use-workspaces"
import {
    X,
    User,
    Tag,
    Calendar,
    Plus,
    Check,
    Search,
    Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const LABEL_COLORS = [
    { name: "red", css: "bg-red-500" },
    { name: "orange", css: "bg-orange-500" },
    { name: "yellow", css: "bg-yellow-500" },
    { name: "green", css: "bg-green-500" },
    { name: "blue", css: "bg-blue-500" },
    { name: "indigo", css: "bg-indigo-500" },
    { name: "purple", css: "bg-purple-500" },
    { name: "pink", css: "bg-pink-500" },
]

const getLabelColorClasses = (color: string) => {
    const map: Record<string, string> = {
        red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
        orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
        yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
        green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
        blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
        purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
        pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
        slate: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
    }
    return map[color] || map.slate
}

export function CreateTaskModal() {
    const { workspaceId, boardId } = useParams()
    const { createTaskOpen, createTaskColumnId, setCreateTaskOpen } = useUIStore()

    const createTask = useCreateTask(boardId || "")
    const createLabel = useCreateLabel(workspaceId || "")

    const { data: members } = useWorkspaceMembers(workspaceId || "")
    const { data: labelsData } = useWorkspaceLabels(workspaceId || "")

    // Form state
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
    const [selectedLabels, setSelectedLabels] = useState<string[]>([])
    const [dueDate, setDueDate] = useState("")
    const [submitting, setSubmitting] = useState(false)

    // Popover state
    const [showAssignees, setShowAssignees] = useState(false)
    const [showLabels, setShowLabels] = useState(false)
    const [assigneeSearch, setAssigneeSearch] = useState("")
    const [labelSearch, setLabelSearch] = useState("")

    // Create label state
    const [showCreateLabel, setShowCreateLabel] = useState(false)
    const [newLabelName, setNewLabelName] = useState("")
    const [newLabelColor, setNewLabelColor] = useState("blue")
    const [creatingLabel, setCreatingLabel] = useState(false)

    if (!createTaskOpen) return null

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setSelectedAssignees([])
        setSelectedLabels([])
        setDueDate("")
        setShowAssignees(false)
        setShowLabels(false)
        setAssigneeSearch("")
        setLabelSearch("")
        setShowCreateLabel(false)
        setNewLabelName("")
        setNewLabelColor("blue")
    }

    const handleClose = () => {
        resetForm()
        setCreateTaskOpen(false)
    }

    const handleSubmit = async () => {
        if (!title.trim() || !createTaskColumnId) return
        setSubmitting(true)
        try {
            await createTask.mutateAsync({
                columnId: createTaskColumnId,
                title: title.trim(),
                description: description.trim() || undefined,
                assigneeIds: selectedAssignees.length > 0 ? selectedAssignees : undefined,
                labelIds: selectedLabels.length > 0 ? selectedLabels : undefined,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            })
            handleClose()
        } catch (err) {
            console.error("Failed to create task:", err)
        } finally {
            setSubmitting(false)
        }
    }

    const handleCreateLabel = async () => {
        if (!newLabelName.trim()) return
        setCreatingLabel(true)
        try {
            const label = await createLabel.mutateAsync({
                name: newLabelName.trim(),
                color: newLabelColor,
            })
            setSelectedLabels((prev) => [...prev, label.id])
            setNewLabelName("")
            setNewLabelColor("blue")
            setShowCreateLabel(false)
        } catch (err) {
            console.error("Failed to create label:", err)
        } finally {
            setCreatingLabel(false)
        }
    }

    const toggleAssignee = (id: string) => {
        setSelectedAssignees((prev) =>
            prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
        )
    }

    const toggleLabel = (id: string) => {
        setSelectedLabels((prev) =>
            prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
        )
    }

    const filteredMembers = (members || []).filter(
        (m: { name: string; email: string }) =>
            m.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
            m.email.toLowerCase().includes(assigneeSearch.toLowerCase()),
    )

    const filteredLabels = (labelsData || []).filter(
        (l: { name: string }) =>
            l.name.toLowerCase().includes(labelSearch.toLowerCase()),
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />
            <div className="relative z-10 w-full max-w-3xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Create New Task
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body - Two Columns */}
                <div className="flex flex-col md:flex-row h-full max-h-[70vh] overflow-hidden">
                    {/* Left Column - Main Content */}
                    <div className="flex-1 px-6 py-5 space-y-5 overflow-y-auto custom-scrollbar border-r border-slate-100 dark:border-slate-700">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter task title..."
                                autoFocus
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={8}
                                placeholder="Add a description..."
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                            />
                        </div>
                    </div>

                    {/* Right Column - Sidebar / Properties */}
                    <div className="w-full md:w-72 bg-slate-50/50 dark:bg-slate-900/30 px-6 py-5 space-y-6 overflow-y-auto custom-scrollbar">
                        {/* Assignees */}
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <User size={14} className="text-slate-400" />
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Assignees
                                </label>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {selectedAssignees.map((id) => {
                                    const member = (members || []).find((m: { id: string }) => m.id === id)
                                    if (!member) return null
                                    const initials = member.name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .toUpperCase()
                                    return (
                                        <span
                                            key={id}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                                            title={member.name}
                                        >
                                            <span className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold">
                                                {initials}
                                            </span>
                                            {member.name.split(" ")[0]}
                                            <button
                                                onClick={() => toggleAssignee(id)}
                                                className="hover:text-red-500 transition-colors"
                                            >
                                                <X size={10} />
                                            </button>
                                        </span>
                                    )
                                })}
                                <button
                                    onClick={() => {
                                        setShowAssignees(!showAssignees)
                                        setShowLabels(false)
                                    }}
                                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary font-medium py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <Plus size={14} />
                                    Assign
                                </button>
                            </div>

                            {/* Assignee Popover */}
                            {showAssignees && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowAssignees(false)}
                                    />
                                    <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                                            <div className="relative">
                                                <Search
                                                    size={16}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                />
                                                <input
                                                    value={assigneeSearch}
                                                    onChange={(e) => setAssigneeSearch(e.target.value)}
                                                    placeholder="Search members..."
                                                    autoFocus
                                                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto custom-scrollbar py-1">
                                            {filteredMembers.length === 0 ? (
                                                <p className="px-4 py-3 text-sm text-slate-400 text-center">
                                                    No members found
                                                </p>
                                            ) : (
                                                filteredMembers.map((member: { id: string; name: string; email: string }) => {
                                                    const initials = member.name
                                                        .split(" ")
                                                        .map((n: string) => n[0])
                                                        .join("")
                                                        .toUpperCase()
                                                    const isSelected = selectedAssignees.includes(member.id)
                                                    return (
                                                        <button
                                                            key={member.id}
                                                            onClick={() => toggleAssignee(member.id)}
                                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                                        >
                                                            <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                                                                {initials}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                                                                    {member.name}
                                                                </p>
                                                            </div>
                                                            {isSelected && <Check size={12} className="text-primary" />}
                                                        </button>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Labels */}
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <Tag size={14} className="text-slate-400" />
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Labels
                                </label>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {selectedLabels.map((id) => {
                                    const label = (labelsData || []).find((l: { id: string }) => l.id === id)
                                    if (!label) return null
                                    return (
                                        <span
                                            key={id}
                                            className={cn(
                                                "inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                                getLabelColorClasses(label.color),
                                            )}
                                        >
                                            {label.name}
                                            <button
                                                onClick={() => toggleLabel(id)}
                                                className="hover:opacity-70 transition-opacity"
                                            >
                                                <X size={8} />
                                            </button>
                                        </span>
                                    )
                                })}
                                <button
                                    onClick={() => {
                                        setShowLabels(!showLabels)
                                        setShowAssignees(false)
                                        setShowCreateLabel(false)
                                    }}
                                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary font-medium py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <Plus size={14} />
                                    Add
                                </button>
                            </div>

                            {/* Label Popover */}
                            {showLabels && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => { setShowLabels(false); setShowCreateLabel(false) }}
                                    />
                                    <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        {!showCreateLabel ? (
                                            <>
                                                <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                                                    <div className="relative">
                                                        <Search
                                                            size={16}
                                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                        />
                                                        <input
                                                            value={labelSearch}
                                                            onChange={(e) => setLabelSearch(e.target.value)}
                                                            placeholder="Search labels..."
                                                            autoFocus
                                                            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto custom-scrollbar py-1">
                                                    {filteredLabels.length === 0 ? (
                                                        <p className="px-4 py-3 text-sm text-slate-400 text-center">
                                                            No labels found
                                                        </p>
                                                    ) : (
                                                        filteredLabels.map((label: { id: string; name: string; color: string }) => {
                                                            const isSelected = selectedLabels.includes(label.id)
                                                            return (
                                                                <button
                                                                    key={label.id}
                                                                    onClick={() => toggleLabel(label.id)}
                                                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                                                >
                                                                    <span
                                                                        className={cn(
                                                                            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                                                            getLabelColorClasses(label.color),
                                                                        )}
                                                                    >
                                                                        {label.name}
                                                                    </span>
                                                                    <div className="flex-1" />
                                                                    {isSelected && <Check size={12} className="text-primary" />}
                                                                </button>
                                                            )
                                                        })
                                                    )}
                                                </div>
                                                <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                                                    <button
                                                        onClick={() => setShowCreateLabel(true)}
                                                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                        Create new label
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-4 space-y-3">
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                    Create Label
                                                </h4>
                                                <input
                                                    value={newLabelName}
                                                    onChange={(e) => setNewLabelName(e.target.value)}
                                                    placeholder="Label name..."
                                                    autoFocus
                                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
                                                />
                                                <div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {LABEL_COLORS.map((c) => (
                                                            <button
                                                                key={c.name}
                                                                onClick={() => setNewLabelColor(c.name)}
                                                                className={cn(
                                                                    "w-5 h-5 rounded-full transition-all",
                                                                    c.css,
                                                                    newLabelColor === c.name
                                                                        ? "ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-800 scale-110"
                                                                        : "hover:scale-110",
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <button
                                                        onClick={() => {
                                                            setShowCreateLabel(false)
                                                            setNewLabelName("")
                                                        }}
                                                        className="flex-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors uppercase"
                                                    >
                                                        Back
                                                    </button>
                                                    <button
                                                        onClick={handleCreateLabel}
                                                        disabled={!newLabelName.trim() || creatingLabel}
                                                        className="flex-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-blue-600 text-white text-[10px] font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-1 uppercase"
                                                    >
                                                        {creatingLabel ? <Loader2 size={10} className="animate-spin" /> : "Create"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Due Date */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={14} className="text-slate-400" />
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Due Date
                                </label>
                            </div>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim() || submitting}
                        className="px-6 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm shadow-blue-500/20"
                    >
                        {submitting && <Loader2 size={16} className="animate-spin" />}
                        Create Task
                    </button>
                </div>
            </div>
        </div>
    )
}
