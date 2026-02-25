import { SidebarContent } from "./sidebar-content"

export function Sidebar() {
    return (
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-white dark:bg-surface-sidebar border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <SidebarContent />
        </aside>
    )
}
