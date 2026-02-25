import { Outlet } from "react-router-dom"
import { Logo } from "@/components/common/logo"

export function PublicLayout() {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display">
            {/* Sticky Navbar */}
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-6 py-4 md:px-10">
                <Logo />
                <a
                    href="/login"
                    className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-9 px-4 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm font-bold transition-colors"
                >
                    Sign In
                </a>
            </header>

            {/* Page content */}
            <Outlet />
        </div>
    )
}
