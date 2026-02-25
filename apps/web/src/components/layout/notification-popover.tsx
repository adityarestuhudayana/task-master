import { useState } from "react"
import { Bell, Check, Clock, User, MessageSquare, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"

export function NotificationPopover() {
    const [isOpen, setIsOpen] = useState(false)
    const { data: notifications = [] } = useNotifications()
    const markRead = useMarkNotificationRead()
    const markAllRead = useMarkAllNotificationsRead()

    const unreadCount = notifications.filter((n: any) => !n.isRead).length

    const getIcon = (type: string) => {
        switch (type) {
            case "comment": return <MessageSquare size={14} className="text-blue-500" />
            case "member_added": return <User size={14} className="text-emerald-500" />
            case "complete": return <Check size={14} className="text-emerald-500" />
            case "move": return <Clock size={14} className="text-amber-500" />
            default: return <AlertCircle size={14} className="text-slate-400" />
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-full bg-primary/10 p-1.5 text-slate-500 hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 group"
            >
                <Bell size={20} className={cn(unreadCount > 0 && "animate-pulse")} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-surface-sidebar">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-3 z-50 w-80 max-h-[480px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllRead.mutate()}
                                    className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest transition-colors"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="px-8 py-12 text-center">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                                        <Bell size={20} className="text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                                        All caught up!
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        No new notifications for you right now.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                    {notifications.map((n: any) => (
                                        <div
                                            key={n.id}
                                            className={cn(
                                                "px-5 py-4 flex gap-4 transition-colors cursor-pointer group relative",
                                                !n.isRead ? "bg-primary/[0.03] dark:bg-primary/[0.02]" : "hover:bg-slate-50 dark:hover:bg-slate-700/30"
                                            )}
                                            onClick={() => {
                                                if (!n.isRead) markRead.mutate(n.id)
                                                // TODO: Navigate to task/board
                                            }}
                                        >
                                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 relative">
                                                {n.actor?.image ? (
                                                    <img src={n.actor.image} alt={n.actor.name} className="h-full w-full rounded-full object-cover" />
                                                ) : (
                                                    <span>{n.actor?.name?.[0] || "?"}</span>
                                                )}
                                                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                                    {getIcon(n.activity.type)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm mb-1 leading-snug",
                                                    !n.isRead ? "font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                                                )}>
                                                    {n.activity.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium uppercase tracking-tight">
                                                    <span>{n.actor?.name || "Someone"}</span>
                                                    <span>•</span>
                                                    <span>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                                                </p>
                                            </div>
                                            {!n.isRead && (
                                                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 self-center" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                                <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-widest transition-colors">
                                    View all activity
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
