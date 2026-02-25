import { useState } from "react"
import { ArrowDownUp, Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export type SortField = "title" | "date" | "priority"
export type SortOrder = "asc" | "desc"

interface BoardSortProps {
    sortBy: SortField
    sortOrder: SortOrder
    onChange: (field: SortField, order: SortOrder) => void
}

export function BoardSort({ sortBy, sortOrder, onChange }: BoardSortProps) {
    const [isOpen, setIsOpen] = useState(false)

    const options: { label: string; value: SortField }[] = [
        { label: "Title", value: "title" },
        { label: "Due Date", value: "date" },
    ]

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-colors py-2 px-3 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                )}
            >
                <ArrowDownUp size={18} />
                Sort
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 z-50 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Sort Board
                            </h3>
                        </div>

                        <div className="p-2 space-y-1">
                            {options.map((option) => (
                                <div key={option.value} className="flex flex-col">
                                    <button
                                        onClick={() => onChange(option.value, sortOrder)}
                                        className={cn(
                                            "flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                                            sortBy === option.value
                                                ? "bg-primary/10 text-primary"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                        )}
                                    >
                                        {option.label}
                                        {sortBy === option.value && <Check size={14} />}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-700 mx-2" />

                        <div className="p-2 flex gap-1">
                            <button
                                onClick={() => onChange(sortBy, "asc")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors",
                                    sortOrder === "asc"
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600"
                                )}
                            >
                                <ChevronUp size={12} />
                                Asc
                            </button>
                            <button
                                onClick={() => onChange(sortBy, "desc")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors",
                                    sortOrder === "desc"
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600"
                                )}
                            >
                                <ChevronDown size={12} />
                                Desc
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
