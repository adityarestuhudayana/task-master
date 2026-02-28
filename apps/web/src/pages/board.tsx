import React, { useState, useCallback, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    useDroppable,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    UserPlus,
    Plus,
    MessageSquare,
    Paperclip,
    Flag,
    Pencil,
    CheckCircle2,
    Loader2,
} from "lucide-react"
import { cn, getUserColor } from "@/lib/utils"
import { useUIStore } from "@/stores/ui-store"
import { useBoard } from "@/hooks/use-boards"
import { useMoveTask } from "@/hooks/use-tasks"
import { useWorkspaceMembers } from "@/hooks/use-workspaces"
import { emitTaskMove, joinBoard, leaveBoard, onTaskMove, onBoardUpdate } from "@/lib/socket"
import { useQueryClient } from "@tanstack/react-query"

import { AvatarGroup } from "@/components/common/avatar-group"
import { BoardFilters } from "@/components/board/board-filters"
import { BoardSort, type SortField, type SortOrder } from "@/components/board/board-sort"
import { useWorkspaceLabels } from "@/hooks/use-workspaces"
import type { Member } from "@/types"

// Types
interface CardData {
    id: string
    title: string
    label: string
    labelColor: string
    comments?: number
    attachments?: number
    assignees: Member[]
    flagged?: boolean
    highlighted?: boolean
    done?: boolean
    date?: string
    rawDate?: string
    labelIds: string[]
}

interface ColumnData {
    id: string
    name: string
    color: string
    cards: CardData[]
}


// Helper: transform API board data into local ColumnData format
function apiToColumns(board: {
    columns: Array<{
        id: string
        name: string
        color: string
        tasks: Array<{
            id: string
            title: string
            completed: boolean
            flagged: boolean
            dueDate?: string | null
            labels: Array<{ id: string; name: string; color: string }>
            assignees: Array<{ id: string; name: string; image?: string | null }>
        }>
    }>
}): ColumnData[] {
    return board.columns.map((col) => ({
        id: col.id,
        name: col.name,
        color: col.color || "bg-slate-400",
        cards: col.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            label: task.labels[0]?.name || "",
            labelColor: task.labels[0]?.color
                ? `bg-${task.labels[0].color}-100 dark:bg-${task.labels[0].color}-900/30 text-${task.labels[0].color}-700`
                : "bg-slate-100 dark:bg-slate-700 text-slate-600",
            assignees: task.assignees.map(a => ({
                id: a.id,
                name: a.name,
                email: "", // Not strictly needed for the group display but matches Member type
                avatarUrl: a.image || undefined,
                initials: a.name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
                color: getUserColor(a.name),
            })),
            done: task.completed,
            flagged: task.flagged,
            date: task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined,
            rawDate: task.dueDate || undefined,
            labelIds: task.labels.map(l => l.id),
        })),
    }))
}

// Sortable Card Component
function SortableCard({ card, onClick }: { card: CardData; onClick: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "group bg-white dark:bg-surface-dark p-4 rounded-lg shadow-sm cursor-pointer transition-all touch-none",
                isDragging && "opacity-50 shadow-lg ring-2 ring-primary/30",
                card.highlighted
                    ? "border-l-4 border-l-primary border-t border-r border-b border-slate-200 dark:border-slate-700 hover:shadow-md"
                    : card.done
                        ? "border border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100 hover:shadow-md"
                        : "border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-md",
            )}
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`${card.labelColor} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider`}>
                    {card.label}
                </span>
                <div className="flex items-center gap-1">
                    {card.done ? (
                        <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                    ) : (
                        <button className="opacity-40 group-hover:opacity-100 text-slate-400 hover:text-primary transition-opacity">
                            <Pencil size={16} />
                        </button>
                    )}
                </div>
            </div>
            <h4
                className={cn(
                    "font-medium text-sm leading-snug mb-3",
                    card.done
                        ? "text-slate-500 dark:text-slate-400 line-through decoration-slate-400/50"
                        : "text-slate-800 dark:text-slate-100",
                )}
            >
                {card.title}
            </h4>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                    {card.comments ? (
                        <>
                            <MessageSquare size={14} />
                            <span>{card.comments}</span>
                        </>
                    ) : card.attachments ? (
                        <>
                            <Paperclip size={14} />
                            <span>{card.attachments}</span>
                        </>
                    ) : card.flagged ? (
                        <Flag size={14} className="text-red-400" />
                    ) : card.date ? (
                        <span className="text-[10px] uppercase font-semibold">{card.date}</span>
                    ) : null}
                </div>
                <AvatarGroup
                    members={card.assignees}
                    max={3}
                    size="sm"
                />
            </div>
        </div>
    )
}

// Wrap in React.memo to prevent unnecessary re-renders when other cards are dragged
const MemoizedSortableCard = React.memo(SortableCard)

// Card overlay for drag
function CardOverlay({ card }: { card: CardData }) {
    return (
        <div className="bg-white dark:bg-surface-dark p-4 rounded-lg shadow-xl border-2 border-primary/30 cursor-grabbing w-[280px] rotate-2">
            <span className={`${card.labelColor} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider`}>
                {card.label}
            </span>
            <h4 className="font-medium text-sm leading-snug mt-2 text-slate-800 dark:text-slate-100">
                {card.title}
            </h4>
        </div>
    )
}

// Kanban Column Component
function KanbanColumn({
    column,
    openTaskDetail,
    openCreateTask,
    isDragInProgress,
}: {
    column: ColumnData
    openTaskDetail: (id: string) => void
    openCreateTask: (id: string) => void
    isDragInProgress?: boolean
}) {
    const { setNodeRef } = useDroppable({
        id: column.id,
    })

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col h-full bg-column-light dark:bg-column-dark rounded-xl border border-slate-200/50 dark:border-slate-700/50 w-[85vw] sm:w-[320px] md:w-auto shrink-0 transition-opacity",
                !isDragInProgress && "snap-center md:snap-none"
            )}
        >
            {/* Column Header */}
            <div className="p-4 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">
                        {column.name}
                    </h3>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">
                        {column.cards.length}
                    </span>
                </div>
            </div>

            {/* Sortable Cards */}
            <SortableContext
                items={column.cards.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 custom-scrollbar">
                    {column.cards.map((card) => (
                        <MemoizedSortableCard
                            key={card.id}
                            card={card}
                            onClick={() => openTaskDetail(card.id)}
                        />
                    ))}
                    {column.cards.length === 0 && (
                        <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-400 text-sm italic">
                            Empty column
                        </div>
                    )}
                </div>
            </SortableContext>

            {/* Add Task */}
            <button
                onClick={() => openCreateTask(column.id)}
                className="mx-3 mb-3 mt-2 py-2 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-all group"
            >
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                Add Task
            </button>
        </div>
    )
}

export function BoardPage() {
    const { workspaceId, boardId } = useParams()
    const { data: boardData, isLoading } = useBoard(boardId || "")
    const moveTask = useMoveTask(boardId || "")
    const { data: wsMembers } = useWorkspaceMembers(workspaceId || "")
    const [columns, setColumns] = useState<ColumnData[]>([])
    const [activeCard, setActiveCard] = useState<CardData | null>(null)
    const [activeColumnId, setActiveColumnId] = useState<string | null>(null)
    const [startPosition, setStartPosition] = useState<number>(0)
    const { openTaskDetail, openCreateTask, openInviteMembers } = useUIStore()
    const { data: apiLabels = [] } = useWorkspaceLabels(workspaceId || "")
    const [filters, setFilters] = useState({
        assigneeIds: [] as string[],
        labelIds: [] as string[],
        hideCompleted: false,
    })
    const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({
        field: "title",
        order: "asc",
    })
    const qc = useQueryClient()

    // 1. Join/Leave board room
    useEffect(() => {
        if (boardId) {
            joinBoard(boardId)
            return () => leaveBoard(boardId)
        }
    }, [boardId])

    // 2. Listen for real-time updates
    useEffect(() => {
        const cleanupMove = onTaskMove(() => {
            qc.invalidateQueries({ queryKey: ["board", boardId] })
        })
        const cleanupUpdate = onBoardUpdate(() => {
            qc.invalidateQueries({ queryKey: ["board", boardId] })
        })
        return () => {
            cleanupMove()
            cleanupUpdate()
        }
    }, [boardId, qc])

    // Sync API data into local state when it arrives
    useEffect(() => {
        if (boardData?.columns) {
            setColumns(apiToColumns(boardData))
        }
    }, [boardData])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    const findColumn = useCallback(
        (cardId: string) => columns.find((col) => col.cards.some((c) => c.id === cardId)),
        [columns],
    )

    const handleDragStart = (event: DragStartEvent) => {
        const card = columns.flatMap((c) => c.cards).find((c) => c.id === event.active.id)
        const col = findColumn(event.active.id as string)
        const pos = col?.cards.findIndex((c) => c.id === event.active.id) ?? 0

        setActiveCard(card ?? null)
        setActiveColumnId(col?.id ?? null)
        setStartPosition(pos)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeCol = findColumn(active.id as string)
        const overCol = findColumn(over.id as string) ?? columns.find((c) => c.id === over.id)

        if (!activeCol || !overCol || activeCol.id === overCol.id) return

        setColumns((prev) => {
            const card = activeCol.cards.find((c) => c.id === active.id)!
            return prev.map((col) => {
                if (col.id === activeCol.id) {
                    return { ...col, cards: col.cards.filter((c) => c.id !== active.id) }
                }
                if (col.id === overCol.id) {
                    const overIndex = col.cards.findIndex((c) => c.id === over.id)
                    const insertAt = overIndex >= 0 ? overIndex : col.cards.length
                    const newCards = [...col.cards]
                    newCards.splice(insertAt, 0, card)
                    return { ...col, cards: newCards }
                }
                return col
            })
        })
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        const fromColId = activeColumnId
        const fromPos = startPosition

        setActiveCard(null)
        setActiveColumnId(null)
        setStartPosition(0)

        if (!over) return

        const activeCol = findColumn(active.id as string)
        const overCol = findColumn(over.id as string) ?? columns.find((c) => c.id === over.id)

        if (!activeCol || !overCol) return

        // Calculate the target index. 
        // If handleDragOver already moved it, activeCol is overCol.
        let newIndex = overCol.cards.findIndex((c) => c.id === over.id)

        // Adjust index if dragging to bottom of column
        if (newIndex === -1) newIndex = overCol.cards.length

        // IMPORTANT: If moved within the SAME column, handleDragOver didn't update state.
        // We do it here. If moved BETWEEN columns, handleDragOver ALREADY updated state.
        const columnChanged = fromColId !== overCol.id
        const positionChanged = fromPos !== newIndex

        if (columnChanged || positionChanged) {
            if (!columnChanged && active.id !== over.id) {
                // Same column reorder - local state sync
                const oldIndex = activeCol.cards.findIndex((c) => c.id === active.id)
                setColumns((prev) =>
                    prev.map((c) =>
                        c.id === activeCol.id ? { ...c, cards: arrayMove(c.cards, oldIndex, newIndex) } : c,
                    ),
                )
            }

            // Always persist to backend if either column or position changed
            moveTask.mutate({
                taskId: active.id as string,
                columnId: overCol.id,
                position: newIndex,
            })

            emitTaskMove({
                taskId: active.id as string,
                fromColumn: fromColId || activeCol.id,
                toColumn: overCol.id,
                position: newIndex,
            })
        }
    }

    if (isLoading && !boardData) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        )
    }

    const filteredColumns = columns.map(col => ({
        ...col,
        cards: col.cards
            .filter(card => {
                if (filters.hideCompleted && card.done) return false
                if (filters.assigneeIds.length > 0 && !card.assignees.some(a => filters.assigneeIds.includes(a.id))) return false
                if (filters.labelIds.length > 0 && !card.labelIds.some(li => filters.labelIds.includes(li))) return false
                return true
            })
            .sort((a, b) => {
                const modifier = sort.order === "asc" ? 1 : -1
                if (sort.field === "title") {
                    return a.title.localeCompare(b.title) * modifier
                }
                if (sort.field === "date") {
                    if (!a.rawDate) return 1
                    if (!b.rawDate) return -1
                    return (new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()) * modifier
                }
                return 0
            })
    }))

    return (
        <div className="h-full flex flex-col p-4 md:p-6">
            {/* Board Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-none">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {boardData?.name || "Project Board"}
                </h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <BoardFilters
                        members={(wsMembers || []).map((m: any) => ({
                            id: m.id,
                            name: m.name,
                            email: m.email,
                            avatarUrl: m.image || undefined,
                            initials: m.name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
                            color: getUserColor(m.name),
                        }))}
                        labels={apiLabels}
                        filters={filters}
                        onChange={setFilters}
                    />
                    <BoardSort
                        sortBy={sort.field}
                        sortOrder={sort.order}
                        onChange={(field, order) => setSort({ field, order })}
                    />
                    <AvatarGroup
                        members={(wsMembers || []).map((m: any) => ({
                            id: m.id,
                            name: m.name,
                            email: m.email,
                            avatarUrl: m.image || undefined,
                            initials: m.name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
                            color: getUserColor(m.name),
                        }))}
                        max={4}
                        size="md"
                        className="ml-2"
                    />
                    <button
                        onClick={() => openInviteMembers(workspaceId || "")}
                        className="bg-primary hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20"
                    >
                        <UserPlus size={16} />
                        <span className="hidden sm:inline">Invite</span>
                    </button>
                </div>
            </div>

            {/* Kanban Columns with DnD */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className={cn(
                    "flex-1 flex flex-nowrap md:grid md:grid-cols-3 gap-4 md:gap-6 min-h-0 pb-4 overflow-x-auto custom-scrollbar items-stretch",
                    !activeCard && "snap-x snap-mandatory"
                )}>
                    {filteredColumns.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            openTaskDetail={openTaskDetail}
                            openCreateTask={openCreateTask}
                            isDragInProgress={!!activeCard}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeCard ? <CardOverlay card={activeCard} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
