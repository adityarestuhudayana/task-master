import { useDashboardData } from "@/hooks/use-auth"
import { useActivity } from "@/hooks/use-activity"
import { useUIStore } from "@/stores/ui-store"
import { CheckCircle2, Clock, Activity, LayoutDashboard, Flag } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

export function DashboardPage() {
    const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboardData()
    const { data: activityData, isLoading: isLoadingActivity } = useActivity(10)
    const { openTaskDetail } = useUIStore()

    if (isLoadingDashboard || isLoadingActivity) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[calc(100vh-64px)]">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium">Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    const stats = dashboardData?.stats || {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        activeBoards: 0,
    }

    const myTasks = dashboardData?.myTasks || []
    const activities = activityData || []

    const statCards = [
        { label: "Total Tasks", value: stats.totalTasks, icon: <LayoutDashboard size={20} />, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Completed", value: stats.completedTasks, icon: <CheckCircle2 size={20} />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Overdue", value: stats.overdueTasks, icon: <Clock size={20} />, color: "text-red-500", bg: "bg-red-500/10" },
        { label: "Active Boards", value: stats.activeBoards, icon: <Activity size={20} />, color: "text-purple-500", bg: "bg-purple-500/10" },
    ]

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back!</h2>
                <p className="text-slate-500 mt-1 text-sm">Here's what's happening across your workspaces.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area (My Tasks) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <LayoutDashboard size={18} className="text-primary" />
                                My Tasks
                            </h3>
                            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {myTasks.length} pending
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            {myTasks.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4">
                                        <CheckCircle2 size={32} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <p className="text-slate-900 dark:text-white font-medium mb-1">All caught up!</p>
                                    <p className="text-sm text-slate-500">You don't have any pending tasks right now.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myTasks.map((task: any) => {
                                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
                                        return (
                                            <div
                                                key={task.id}
                                                onClick={() => openTaskDetail(task.id)}
                                                className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex gap-4"
                                            >
                                                <div className="pt-1">
                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary transition-colors" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <h4 className="font-medium text-slate-900 dark:text-white text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                                            {task.title}
                                                        </h4>
                                                        {task.flagged && (
                                                            <Flag size={14} className="text-red-500 fill-red-500 shrink-0" />
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        {task.labels?.map((label: any) => (
                                                            <span
                                                                key={label.id}
                                                                className={cn(
                                                                    "px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide shadow-sm",
                                                                    `bg-${label.color}-500/10 text-${label.color}-700 dark:text-${label.color}-400 ring-1 ring-inset ring-${label.color}-500/20`
                                                                )}
                                                            >
                                                                {label.name}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                            <Link to={`/w/${task.workspaceId}/b/${task.boardId}`} className="hover:text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                                                                {task.workspaceName} / {task.boardName}
                                                            </Link>
                                                        </div>
                                                        {task.dueDate && (
                                                            <div className={cn(
                                                                "flex items-center gap-1.5 font-medium px-2 py-1 rounded-md",
                                                                isOverdue ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" : "bg-slate-50 dark:bg-slate-800/50 text-slate-500"
                                                            )}>
                                                                <Clock size={12} />
                                                                {format(new Date(task.dueDate), "MMM d")}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar (Recent Activity) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Activity size={18} className="text-primary" />
                                Recent Activity
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            {activities.length === 0 ? (
                                <div className="text-center text-slate-500 text-sm mt-8">
                                    No recent activity.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activities.map((activity: any) => (
                                        <div key={activity.id} className="flex gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white dark:border-slate-700",
                                                activity.type === "complete" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                                    activity.type === "member_added" ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" :
                                                        "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                                            )}>
                                                {activity.type === "complete" ? <CheckCircle2 size={14} /> :
                                                    activity.type === "member_added" ? <Flag size={14} /> :
                                                        <Activity size={14} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                                    <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                                                        {activity.user?.name || "Someone"}
                                                    </span>
                                                    <time className="text-[10px] font-medium text-slate-400 shrink-0">
                                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                                    </time>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                                                    {activity.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
