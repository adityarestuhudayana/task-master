import { Outlet } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"
import { CreateWorkspaceModal } from "@/components/workspace/create-workspace-modal"
import { WorkspaceSettingsModal } from "@/components/workspace/workspace-settings-modal"
import { TaskDetailModal } from "@/components/task/task-detail-modal"
import { CreateTaskModal } from "@/components/task/create-task-modal"
import { InviteMembersModal } from "@/components/workspace/invite-members-modal"
import { ErrorBoundary } from "react-error-boundary"
import { GlobalErrorFallback } from "@/components/ui/error-fallback"

export function AppLayout() {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-200">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <TopNav />
                <div className="flex-1 overflow-y-auto">
                    <ErrorBoundary FallbackComponent={GlobalErrorFallback} onReset={() => window.location.reload()}>
                        <Outlet />
                    </ErrorBoundary>
                </div>
            </main>

            {/* Modals */}
            <CreateWorkspaceModal />
            <WorkspaceSettingsModal />
            <TaskDetailModal />
            <CreateTaskModal />
            <InviteMembersModal />
        </div>
    )
}
