import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createBoardSchema, type CreateBoardValues } from "@/lib/validators"
import { useCreateBoard } from "@/hooks/use-boards"
import { useUIStore } from "@/stores/ui-store"
import { X, Layout } from "lucide-react"
import { useParams } from "react-router-dom"

const BOARD_COLORS = [
    { name: "Blue", value: "bg-blue-500" },
    { name: "Indigo", value: "bg-indigo-500" },
    { name: "Violet", value: "bg-violet-500" },
    { name: "Fuchsia", value: "bg-fuchsia-500" },
    { name: "Pink", value: "bg-pink-500" },
    { name: "Rose", value: "bg-rose-500" },
    { name: "Orange", value: "bg-orange-500" },
    { name: "Amber", value: "bg-amber-500" },
    { name: "Emerald", value: "bg-emerald-500" },
    { name: "Teal", value: "bg-teal-500" },
]

export function CreateBoardModal() {
    const { workspaceId } = useParams()
    const { createBoardOpen, setCreateBoardOpen } = useUIStore()

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CreateBoardValues>({
        resolver: zodResolver(createBoardSchema),
        defaultValues: {
            color: "bg-blue-500",
        },
    })

    const createBoard = useCreateBoard(workspaceId!)

    const selectedColor = watch("color")

    const onClose = () => {
        setCreateBoardOpen(false)
        reset()
    }

    const onSubmit = async (data: CreateBoardValues) => {
        try {
            await createBoard.mutateAsync(data)
            onClose()
        } catch {
            // Error handled by mutation
        }
    }

    if (!createBoardOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Layout size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Create Board
                            </h2>
                            <p className="text-xs text-slate-500">
                                Create a new board to organize your tasks
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-6">
                    {/* Board Name */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Board Name <span className="text-red-500">*</span>
                        </span>
                        <input
                            {...register("name")}
                            autoFocus
                            placeholder="e.g., Project Alpha"
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                        />
                        {errors.name && (
                            <span className="text-xs text-red-500">{errors.name.message}</span>
                        )}
                    </label>

                    {/* Color Picker */}
                    <div className="space-y-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Board Color
                        </span>
                        <div className="grid grid-cols-5 gap-2">
                            {BOARD_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setValue("color", color.value)}
                                    className={`h-8 rounded-md transition-all ${color.value} ${selectedColor === color.value
                                        ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-800 scale-110 shadow-sm"
                                        : "hover:scale-105 opacity-80 hover:opacity-100"
                                        }`}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? "Creating..." : "Create Board"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
