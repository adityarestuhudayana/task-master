import { useLocation } from "react-router-dom"
import { Menu } from "lucide-react"
import { NotificationPopover } from "./notification-popover"
import { useCurrentUser } from "@/hooks/use-auth"
import { useUIStore } from "@/stores/ui-store"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { SidebarContent } from "./sidebar-content"

export function TopNav() {
    const location = useLocation()
    const { data: user } = useCurrentUser()
    const { sidebarOpen, setSidebarOpen } = useUIStore()

    const getTitle = () => {
        if (location.pathname === "/dashboard") return "Dashboard"
        if (location.pathname === "/settings") return "Settings"
        if (location.pathname.includes("/b/")) return "Project Board"
        return "TaskMaster"
    }

    const initials = user?.name
        ? user.name.split(" ").map((n: any) => n[0]).join("").toUpperCase()
        : "??"

    return (
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white dark:bg-surface-sidebar border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            {/* Mobile Nav Toggle & Breadcrumbs */}
            <div className="flex items-center gap-3">
                <div className="md:hidden">
                    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                        <SheetTrigger asChild>
                            <button className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                                <Menu size={24} />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64 border-r-0">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex items-center text-sm font-medium text-slate-500">
                    <span className="text-slate-900 dark:text-white font-semibold">
                        {getTitle()}
                    </span>
                </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
                <NotificationPopover />
                <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold shadow-sm cursor-pointer hover:opacity-90 transition-opacity overflow-hidden outline outline-2 outline-white dark:outline-surface-sidebar">
                    {user?.image ? (
                        <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>
            </div>
        </header>
    )
}
