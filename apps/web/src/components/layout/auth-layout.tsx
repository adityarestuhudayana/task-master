import { Outlet } from "react-router-dom"

export function AuthLayout() {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col">
            <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
            <footer className="py-6 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                    © 2025 TaskMaster Inc. All rights reserved.
                </p>
            </footer>
        </div>
    )
}
