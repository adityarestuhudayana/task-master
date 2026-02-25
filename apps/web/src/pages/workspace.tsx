import { useParams, Link } from "react-router-dom"
import { Plus, FileEdit, CheckCircle2, UserPlus, Settings } from "lucide-react"
import { useBoards } from "@/hooks/use-boards"
import { useActivity } from "@/hooks/use-activity"
import { useWorkspaces } from "@/hooks/use-workspaces"
import { useUIStore } from "@/stores/ui-store";
import { CreateBoardModal } from "@/components/board/create-board-modal"
import { BoardSettingsModal } from "@/components/board/board-settings-modal"
import { AvatarGroup } from "@/components/common/avatar-group"
import { getUserColor } from "@/lib/utils"

const activityIconMap: Record<string, { icon: typeof FileEdit; iconBg: string }> = {
    update: { icon: FileEdit, iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
    complete: { icon: CheckCircle2, iconBg: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
    member_added: { icon: UserPlus, iconBg: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
    comment: { icon: FileEdit, iconBg: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" },
    move: { icon: FileEdit, iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" },
}

export function WorkspacePage() {
    const { workspaceId } = useParams()
    const { data: apiBoards } = useBoards(workspaceId)
    const { data: apiActivity } = useActivity(10, workspaceId)
    const { data: apiWorkspaces = [] } = useWorkspaces()
    const { setCreateBoardOpen, openBoardSettings } = useUIStore()

    const currentWorkspace = apiWorkspaces.find((w: any) => w.id === workspaceId)

    const boards = apiBoards?.map((b: any) => ({
        id: b.id,
        name: b.name,
        workspace: currentWorkspace?.name || "Workspace",
        workspaceId: b.workspaceId,
        color: b.color || "bg-blue-500",
        status: b.status || "Active",
        members: (b.members || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            avatarUrl: m.image || undefined,
            initials: m.name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
            color: getUserColor(m.name),
        })),
    })) || []

    const activities = apiActivity?.map((a: { id: string; type: string; message: string; createdAt: string }) => {
        const iconInfo = activityIconMap[a.type] || activityIconMap.update
        return {
            id: a.id,
            icon: iconInfo.icon,
            iconBg: iconInfo.iconBg,
            message: <>{a.message}</>,
            time: new Date(a.createdAt).toLocaleDateString(),
        }
    }) || []

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {currentWorkspace?.name || "Workspace"}
                    </h2>
                    <p className="text-slate-500 mt-1 text-sm">
                        {currentWorkspace?.description || "Manage your projects and track progress."}
                    </p>
                </div>

                {/* Boards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {boards.map((board: any) => (
                        <Link
                            key={board.id}
                            to={`/w/${workspaceId}/b/${board.id}`}
                            className="group relative flex flex-col justify-between h-40 bg-white dark:bg-[#1e2732] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-200 cursor-pointer overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 ${board.color}`} />
                            <div className="p-5 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                                            {board.name}
                                        </h3>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                openBoardSettings(board.id)
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                                        >
                                            <Settings size={16} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500">{board.workspace}</p>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <AvatarGroup
                                        members={board.members}
                                        max={3}
                                        size="sm"
                                    />
                                    <span className="text-xs font-medium text-slate-400 group-hover:text-primary transition-colors">
                                        {board.status}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Create New Board */}
                    <button
                        onClick={() => setCreateBoardOpen(true)}
                        className="group flex flex-col items-center justify-center h-40 bg-slate-50 dark:bg-[#151b23] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-white dark:bg-[#1e2732] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200 border border-slate-200 dark:border-slate-700">
                                <Plus size={20} className="text-primary" />
                            </div>
                            <span className="font-semibold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors text-sm">
                                Create New Board
                            </span>
                        </div>
                    </button>
                </div>

                {/* Recent Activity */}
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Recent Activity
                        </h3>
                        <button className="text-sm font-medium text-primary hover:text-primary/80">
                            View all
                        </button>
                    </div>
                    <div className="bg-white dark:bg-[#1e2732] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {activities.map((activity: any) => (
                                <div
                                    key={activity.id}
                                    className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-[#252e3a] transition-colors"
                                >
                                    <div
                                        className={`h-8 w-8 rounded-full flex items-center justify-center ${activity.iconBg}`}
                                    >
                                        <activity.icon size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                            {activity.message}
                                        </p>
                                        <p className="text-xs text-slate-500">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <CreateBoardModal />
            <BoardSettingsModal />
        </div>
    )
}
