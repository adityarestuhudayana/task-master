import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createWorkspaceSchema, type CreateWorkspaceValues } from "@/lib/validators"
import { useCreateWorkspace } from "@/hooks/use-workspaces"
import { useUIStore } from "@/stores/ui-store"
import { X, Briefcase } from "lucide-react"

export function CreateWorkspaceModal() {
    const { createWorkspaceOpen, setCreateWorkspaceOpen } = useUIStore()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateWorkspaceValues>({
        resolver: zodResolver(createWorkspaceSchema),
    })

    const createWorkspace = useCreateWorkspace()

    const onClose = () => {
        setCreateWorkspaceOpen(false)
        reset()
    }

    const onSubmit = async (data: CreateWorkspaceValues) => {
        try {
            await createWorkspace.mutateAsync(data)
            onClose()
        } catch {
            // Error handled by mutation
        }
    }

    if (!createWorkspaceOpen) return null

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
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Create Workspace
                            </h2>
                            <p className="text-xs text-slate-500">
                                Set up a new workspace for your team
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
                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
                    {/* Workspace Name */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Workspace Name <span className="text-red-500">*</span>
                        </span>
                        <input
                            {...register("name")}
                            placeholder="e.g., Marketing Team"
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                        />
                        {errors.name && (
                            <span className="text-xs text-red-500">{errors.name.message}</span>
                        )}
                    </label>

                    {/* Description */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Description{" "}
                            <span className="text-slate-400 font-normal">(optional)</span>
                        </span>
                        <textarea
                            {...register("description")}
                            rows={3}
                            placeholder="What's this workspace for?"
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                        />
                        {errors.description && (
                            <span className="text-xs text-red-500">
                                {errors.description.message}
                            </span>
                        )}
                    </label>

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
                            className="px-5 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                        >
                            Create Workspace
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
