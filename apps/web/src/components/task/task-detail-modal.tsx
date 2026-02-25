import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useUIStore } from "@/stores/ui-store"
import { useTask, useUpdateTask, useDeleteTask, useAddTaskAssignee, useRemoveTaskAssignee, useAddTaskLabel, useRemoveTaskLabel } from "@/hooks/use-tasks"
import { useComments, useCreateComment } from "@/hooks/use-comments"
import { useCurrentUser } from "@/hooks/use-auth"
import { useWorkspaceMembers, useWorkspaceLabels, useCreateLabel } from "@/hooks/use-workspaces"
import {
    X,
    User,
    Tag,
    Calendar,
    MessageSquare,
    Trash2,
    MoreHorizontal,
    CheckCircle2,
    AlignLeft,
    Plus,
    Search,
    Check,
    Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LABEL_COLORS, getLabelColorClasses } from "@/lib/colors"

export function TaskDetailModal() {
    const { taskDetailOpen, taskDetailId, closeTaskDetail } = useUIStore()
    const { workspaceId, boardId } = useParams()
    const { data: apiTask } = useTask(taskDetailId || "")
    const { data: apiComments } = useComments(taskDetailId || "")
    const { data: currentUser } = useCurrentUser()

    // Mutation hooks
    const updateTask = useUpdateTask(boardId || "")
    const deleteTask = useDeleteTask(boardId || "")
    const createComment = useCreateComment(taskDetailId || "")
    const createLabel = useCreateLabel(workspaceId || "")

    const addTaskAssignee = useAddTaskAssignee(boardId || "")
    const removeTaskAssignee = useRemoveTaskAssignee(boardId || "")
    const addTaskLabel = useAddTaskLabel(boardId || "")
    const removeTaskLabel = useRemoveTaskLabel(boardId || "")

    // External data
    const { data: members } = useWorkspaceMembers(workspaceId || "")
    const { data: labelsData } = useWorkspaceLabels(workspaceId || "")

    // Form state (buffered)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [localAssignees, setLocalAssignees] = useState<any[]>([])
    const [localLabels, setLocalLabels] = useState<any[]>([])
    const [localCompleted, setLocalCompleted] = useState(false)
    const [newComment, setNewComment] = useState("")
    const [saving, setSaving] = useState(false)

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

    // Sync state when API data arrives
    useEffect(() => {
        if (apiTask) {
            setTitle(apiTask.title || "")
            setDescription(apiTask.description || "")
            setDueDate(apiTask.dueDate ? new Date(apiTask.dueDate).toISOString().split("T")[0] : "")
            setLocalAssignees(apiTask.assignees || [])
            setLocalLabels(apiTask.labels || [])
            setLocalCompleted(apiTask.completed || false)
        }
    }, [apiTask])

    if (!taskDetailOpen || !apiTask) return null

    const handleSave = async () => {
        if (!title.trim()) return
        setSaving(true)
        try {
            // 1. Update basic task info
            await updateTask.mutateAsync({
                taskId: apiTask.id,
                title: title.trim(),
                description: description.trim() || null,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                completed: localCompleted,
            })

            // 2. Sync assignees
            const currentAssigneeIds = (apiTask.assignees || []).map((a: any) => a.id)
            const localAssigneeIds = localAssignees.map((a: any) => a.id)

            const toAddAssignees = localAssigneeIds.filter((id: string) => !currentAssigneeIds.includes(id))
            const toRemoveAssignees = currentAssigneeIds.filter((id: string) => !localAssigneeIds.includes(id))

            await Promise.all([
                ...toAddAssignees.map((userId: string) => addTaskAssignee.mutateAsync({ taskId: apiTask.id, userId })),
                ...toRemoveAssignees.map((userId: string) => removeTaskAssignee.mutateAsync({ taskId: apiTask.id, userId }))
            ])

            // 3. Sync labels
            const currentLabelIds = (apiTask.labels || []).map((l: any) => l.id)
            const localLabelIds = localLabels.map((l: any) => l.id)

            const toAddLabels = localLabelIds.filter((id: string) => !currentLabelIds.includes(id))
            const toRemoveLabels = currentLabelIds.filter((id: string) => !localLabelIds.includes(id))

            await Promise.all([
                ...toAddLabels.map((labelId: string) => addTaskLabel.mutateAsync({ taskId: apiTask.id, labelId })),
                ...toRemoveLabels.map((labelId: string) => removeTaskLabel.mutateAsync({ taskId: apiTask.id, labelId }))
            ])

            closeTaskDetail()

        } catch (err) {
            console.error("Failed to update task:", err)
        } finally {
            setSaving(false)
        }
    }

    const handleToggleComplete = () => {
        setLocalCompleted(prev => !prev)
    }

    const handleAddComment = async () => {
        if (!newComment.trim()) return
        await createComment.mutateAsync({ content: newComment })
        setNewComment("")
    }

    const handleDeleteTask = async () => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            await deleteTask.mutateAsync(apiTask.id)
            closeTaskDetail()
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
            // Add to local labels buffer
            setLocalLabels(prev => [...prev, label])
            setNewLabelName("")
            setNewLabelColor("blue")
            setShowCreateLabel(false)
        } catch (err) {
            console.error("Failed to create label:", err)
        } finally {
            setCreatingLabel(false)
        }
    }

    const toggleAssignee = (member: any) => {
        const isAssigned = localAssignees.some((a) => a.id === member.id)
        if (isAssigned) {
            setLocalAssignees(prev => prev.filter(a => a.id !== member.id))
        } else {
            setLocalAssignees(prev => [...prev, member])
        }
    }

    const toggleLabel = (label: any) => {
        const hasLabel = localLabels.some((l) => l.id === label.id)
        if (hasLabel) {
            setLocalLabels(prev => prev.filter(l => l.id !== label.id))
        } else {
            setLocalLabels(prev => [...prev, label])
        }
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

    const userInitials = currentUser?.name
        ? currentUser.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
        : "U"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeTaskDetail}
            />
            <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                {apiTask.column?.name || "Task"}
                            </span>
                        </div>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-2xl font-bold text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300"
                            placeholder="Task title..."
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                        <button
                            onClick={closeTaskDetail}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Body — two column layout */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col md:flex-row h-full min-h-0">
                        {/* Left: Description + Comments */}
                        <div className="flex-1 px-8 py-6 space-y-8">
                            {/* Description */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <AlignLeft size={18} className="text-slate-400" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Description
                                    </h3>
                                </div>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={6}
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                                    placeholder="Add a more detailed description..."
                                />
                            </div>

                            {/* Comments Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <MessageSquare size={18} className="text-slate-400" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Comments ({(apiComments || []).length})
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    {/* New comment input */}
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">
                                            {userInitials}
                                        </div>
                                        <div className="flex-1">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                rows={2}
                                                placeholder="Write a comment..."
                                                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                                            />
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    disabled={!newComment.trim() || createComment.isPending}
                                                    onClick={handleAddComment}
                                                    className="px-4 py-1.5 rounded-lg bg-primary hover:bg-blue-600 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-2 shadow-sm shadow-blue-500/10"
                                                >
                                                    {createComment.isPending && <Loader2 size={12} className="animate-spin" />}
                                                    Comment
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {(apiComments || []).map((comment: any) => {
                                            const initials = comment.author?.name
                                                ? comment.author.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
                                                : "U"
                                            return (
                                                <div key={comment.id} className="flex gap-4 group">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                        {initials}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                                {comment.author?.name || "User"}
                                                            </span>
                                                            <span className="text-[10px] uppercase font-bold text-slate-400">
                                                                {new Date(comment.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl px-4 py-3 border border-slate-100 dark:border-slate-700/50">
                                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                                {comment.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Sidebar Properties */}
                        <div className="w-80 border-l border-slate-100 dark:border-slate-700 px-6 py-6 space-y-8 flex-shrink-0 bg-slate-50/30 dark:bg-slate-900/10">
                            {/* Assignees */}
                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-slate-400" />
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Assignees
                                        </h4>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowAssignees(!showAssignees)
                                            setShowLabels(false)
                                        }}
                                        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {localAssignees.map((a: any) => {
                                        const initials = a.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
                                        return (
                                            <div key={a.id} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shadow-sm">
                                                        {initials}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                                                        {a.name}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => toggleAssignee(a)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )
                                    })}
                                    {localAssignees.length === 0 && (
                                        <p className="text-xs text-slate-400 italic">No one assigned</p>
                                    )}
                                </div>

                                {/* Assignee Popover */}
                                {showAssignees && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowAssignees(false)}
                                        />
                                        <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                                                <div className="relative">
                                                    <Search
                                                        size={14}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                    />
                                                    <input
                                                        value={assigneeSearch}
                                                        onChange={(e) => setAssigneeSearch(e.target.value)}
                                                        placeholder="Search members..."
                                                        autoFocus
                                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar py-1">
                                                {filteredMembers.length === 0 ? (
                                                    <p className="px-4 py-3 text-sm text-slate-400 text-center">
                                                        No members found
                                                    </p>
                                                ) : (
                                                    filteredMembers.map((member: any) => {
                                                        const initials = member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
                                                        return (
                                                            <button
                                                                key={member.id}
                                                                onClick={() => toggleAssignee(member)}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                                            >
                                                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shadow-sm">
                                                                    {initials}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                                        {member.name}
                                                                    </p>
                                                                </div>
                                                                {localAssignees.some((a: any) => a.id === member.id) && <Check size={14} className="text-primary" />}
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
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Tag size={16} className="text-slate-400" />
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Labels
                                        </h4>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowLabels(!showLabels)
                                            setShowAssignees(false)
                                            setShowCreateLabel(false)
                                        }}
                                        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {localLabels.map((label: any) => (
                                        <span
                                            key={label.id}
                                            className={cn(
                                                "inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm",
                                                getLabelColorClasses(label.color),
                                            )}
                                        >
                                            {label.name}
                                            <button
                                                onClick={() => toggleLabel(label)}
                                                className="hover:opacity-70 transition-opacity"
                                            >
                                                <X size={10} />
                                            </button>
                                        </span>
                                    ))}
                                    {localLabels.length === 0 && (
                                        <p className="text-xs text-slate-400 italic">No labels</p>
                                    )}
                                </div>

                                {/* Label Popover */}
                                {showLabels && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => { setShowLabels(false); setShowCreateLabel(false) }}
                                        />
                                        <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {!showCreateLabel ? (
                                                <>
                                                    <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                                                        <div className="relative">
                                                            <Search
                                                                size={14}
                                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                            />
                                                            <input
                                                                value={labelSearch}
                                                                onChange={(e) => setLabelSearch(e.target.value)}
                                                                placeholder="Search labels..."
                                                                autoFocus
                                                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto custom-scrollbar py-1">
                                                        {filteredLabels.length === 0 ? (
                                                            <p className="px-4 py-3 text-sm text-slate-400 text-center">
                                                                No labels found
                                                            </p>
                                                        ) : (
                                                            filteredLabels.map((label: any) => {
                                                                return (
                                                                    <button
                                                                        key={label.id}
                                                                        onClick={() => toggleLabel(label)}
                                                                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                                                    >
                                                                        <span
                                                                            className={cn(
                                                                                "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm",
                                                                                getLabelColorClasses(label.color),
                                                                            )}
                                                                        >
                                                                            {label.name}
                                                                        </span>
                                                                        {localLabels.some((l: any) => l.id === label.id) && <Check size={14} className="text-primary" />}
                                                                    </button>
                                                                )
                                                            })
                                                        )}
                                                    </div>
                                                    <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                                                        <button
                                                            onClick={() => setShowCreateLabel(true)}
                                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors uppercase tracking-wider"
                                                        >
                                                            <Plus size={14} />
                                                            Create custom label
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="p-4 space-y-4">
                                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                        New Label
                                                    </h4>
                                                    <input
                                                        value={newLabelName}
                                                        onChange={(e) => setNewLabelName(e.target.value)}
                                                        placeholder="Label name..."
                                                        autoFocus
                                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
                                                    />
                                                    <div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {LABEL_COLORS.map((c) => (
                                                                <button
                                                                    key={c.name}
                                                                    onClick={() => setNewLabelColor(c.name)}
                                                                    className={cn(
                                                                        "w-6 h-6 rounded-full transition-all shadow-sm",
                                                                        c.css,
                                                                        newLabelColor === c.name
                                                                            ? "ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-800 scale-110"
                                                                            : "hover:scale-110",
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-2">
                                                        <button
                                                            onClick={() => {
                                                                setShowCreateLabel(false)
                                                                setNewLabelName("")
                                                            }}
                                                            className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors uppercase tracking-wider"
                                                        >
                                                            Back
                                                        </button>
                                                        <button
                                                            onClick={handleCreateLabel}
                                                            disabled={!newLabelName.trim() || creatingLabel}
                                                            className="flex-1 px-3 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm"
                                                        >
                                                            {creatingLabel ? <Loader2 size={12} className="animate-spin" /> : "Create"}
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
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar size={16} className="text-slate-400" />
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Due Date
                                    </h4>
                                </div>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition shadow-sm"
                                />
                            </div>

                            {/* Actions */}
                            <div className="pt-8 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                <button
                                    onClick={handleToggleComplete}
                                    className={cn(
                                        "flex items-center gap-2 text-sm font-bold uppercase tracking-wider w-full py-2.5 px-4 rounded-xl transition-all shadow-sm",
                                        localCompleted
                                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/10"
                                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-900/50 dark:text-slate-400"
                                    )}
                                >
                                    <CheckCircle2 size={18} />
                                    {localCompleted ? "Completed" : "Mark Complete"}
                                </button>
                                <button
                                    onClick={handleDeleteTask}
                                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 w-full py-2.5 px-4 rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                    Delete Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
                    <button
                        onClick={closeTaskDetail}
                        className="px-6 py-2 rounded-xl text-sm font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !title.trim()}
                        className="px-8 py-2 rounded-xl bg-primary hover:bg-blue-600 text-white text-sm font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving && <Loader2 size={16} className="animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
