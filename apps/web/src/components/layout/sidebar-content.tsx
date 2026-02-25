import { Link, useLocation } from "react-router-dom"
import { Logo } from "@/components/common/logo"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { useUIStore } from "@/stores/ui-store"
import { useWorkspaces } from "@/hooks/use-workspaces"
import {
    Home,
    Settings,
    Plus,
    Layout,
    UserPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarContentProps {
    onNavigate?: () => void
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
    const location = useLocation()
    const { setCreateWorkspaceOpen, openWorkspaceSettings, openInviteMembers } = useUIStore()
    const { data: apiWorkspaces = [] } = useWorkspaces()

    const workspaces = apiWorkspaces.map((ws: { id: string; name: string }) => ({
        ...ws,
        icon: Layout,
    }))

    return (
        <div className="flex flex-col h-full bg-white dark:bg-surface-sidebar">
            {/* Logo Section */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                <Logo />
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                {/* Main Nav */}
                <div className="space-y-1">
                    <Link
                        to="/dashboard"
                        onClick={onNavigate}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors",
                            location.pathname === "/dashboard"
                                ? "bg-primary/10 text-primary"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
                        )}
                    >
                        <Home size={20} />
                        <span className="font-medium text-sm">Home</span>
                    </Link>
                </div>

                {/* Workspaces Section */}
                <div>
                    <div className="flex items-center justify-between px-3 mb-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Workspaces
                        </h3>
                        <button
                            onClick={() => {
                                setCreateWorkspaceOpen(true)
                                onNavigate?.()
                            }}
                            className="text-slate-400 hover:text-primary transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="space-y-1">
                        {workspaces.map((ws: any) => (
                            <Link
                                key={ws.id}
                                to={`/w/${ws.id}`}
                                onClick={onNavigate}
                                className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors group"
                            >
                                <ws.icon
                                    size={20}
                                    className="group-hover:text-primary transition-colors"
                                />
                                <span className="font-medium text-sm flex-1 truncate">{ws.name}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            openInviteMembers(ws.id)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all"
                                        title="Invite Members"
                                    >
                                        <UserPlus size={14} className="text-slate-400 hover:text-primary" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            openWorkspaceSettings(ws.id)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all"
                                        title="Workspace Settings"
                                    >
                                        <Settings size={14} className="text-slate-400 hover:text-primary" />
                                    </button>
                                </div>
                            </Link>
                        ))}
                        {workspaces.length === 0 && (
                            <p className="text-xs text-slate-400 px-3 italic">No workspaces</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 flex-shrink-0">
                <div className="flex items-center justify-between px-3">
                    <span className="text-xs font-medium text-slate-500">Theme</span>
                    <ThemeToggle />
                </div>
                <Link
                    to="/settings"
                    onClick={onNavigate}
                    className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                    <Settings size={20} />
                    <span className="font-medium text-sm">Settings</span>
                </Link>
            </div>
        </div>
    )
}
