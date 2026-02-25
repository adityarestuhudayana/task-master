import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

export function LandingPage() {
    return (
        <>
            <main className="flex w-full flex-1 flex-col items-center justify-start pt-8 pb-8 px-4 md:pt-24 md:pb-12 md:px-10 overflow-x-hidden">
                <div className="flex w-full flex-col max-w-[960px] flex-1 items-center gap-8 md:gap-10">
                    {/* Hero Text */}
                    <div className="flex w-full flex-col gap-4 md:gap-6 text-center max-w-[720px]">
                        <h1 className="text-slate-900 dark:text-slate-50 text-3xl sm:text-4xl md:text-6xl font-black leading-tight tracking-[-0.033em]">
                            Manage team tasks <br className="hidden md:block" />
                            with ease
                        </h1>
                        <h2 className="text-slate-600 dark:text-slate-400 text-base sm:text-lg md:text-xl font-normal leading-relaxed px-2 md:px-0">
                            Streamline your workflow without the clutter. The simplest way to
                            keep your team organized and projects moving forward.
                        </h2>
                        <div className="flex w-full flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mt-2 px-2 sm:px-0">
                            <Link
                                to="/signup"
                                className="flex w-full sm:w-auto min-w-[140px] md:min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 md:h-12 md:px-6 bg-primary hover:bg-primary/90 text-slate-50 text-sm md:text-base font-bold tracking-[0.015em] transition-all shadow-lg shadow-primary/25"
                            >
                                Get Started Free
                                <div className="w-4 h-4 md:w-[18px] md:h-[18px] flex items-center justify-center">
                                    <ArrowRight className="w-full h-full" />
                                </div>
                            </Link>
                            <Link
                                to="/login"
                                className="flex w-full sm:w-auto min-w-[140px] md:min-w-[160px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 md:h-12 md:px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-50 text-sm md:text-base font-bold tracking-[0.015em] transition-all"
                            >
                                View Demo
                            </Link>
                        </div>
                    </div>

                    {/* Kanban Mockup Visual */}
                    <div className="w-full mt-8 relative group">
                        {/* Background glow */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-xl blur-2xl -z-10 opacity-70" />

                        {/* Board mock */}
                        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[400px] sm:h-[450px] md:h-[600px]">
                            {/* Mock header */}
                            <div className="h-12 md:h-14 flex-none border-b border-slate-100 dark:border-slate-800 flex items-center px-4 md:px-6 gap-3 md:gap-4 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">
                                        🔍
                                    </div>
                                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-bold">
                                            JD
                                        </div>
                                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-purple-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-bold">
                                            KR
                                        </div>
                                        <div className="w-8 h-8 flex-shrink-0 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400">
                                            +3
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1" />
                                <div className="hidden sm:flex items-center gap-3">
                                    <span className="text-sm font-medium text-slate-500">Filter</span>
                                    <span className="text-sm font-medium text-slate-500">Sort</span>
                                    <span className="bg-primary text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                                        + New Task
                                    </span>
                                </div>
                            </div>

                            {/* Kanban columns mock */}
                            <div className="flex-1 p-3 md:p-6 overflow-x-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex gap-3 md:gap-6 h-full min-w-max pb-3 md:pb-0">
                                    {/* Backlog */}
                                    <div className="flex-1 flex flex-col gap-3 min-w-[200px]">
                                        <div className="flex items-center gap-2 mb-2 px-1">
                                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Backlog
                                            </h3>
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                                3
                                            </span>
                                        </div>
                                        <MockCard label="Design" labelColor="purple" title="Update brand style guide" />
                                        <MockCard label="Dev" labelColor="blue" title="Refactor auth flow" />
                                        <MockCardSkeleton />
                                    </div>

                                    {/* In Progress */}
                                    <div className="flex-1 flex flex-col gap-3 min-w-[200px]">
                                        <div className="flex items-center gap-2 mb-2 px-1">
                                            <span className="w-2 h-2 rounded-full bg-primary" />
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                In Progress
                                            </h3>
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                                2
                                            </span>
                                        </div>
                                        <MockCard
                                            label="Marketing"
                                            labelColor="orange"
                                            title="Q4 Campaign Landing Page"
                                            hasProgress
                                            highlighted
                                        />
                                        <MockCard label="Dev" labelColor="blue" title="Implement dark mode toggle" />
                                    </div>

                                    {/* Done */}
                                    <div className="flex-1 flex flex-col gap-3 min-w-[200px] opacity-60">
                                        <div className="flex items-center gap-2 mb-2 px-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500" />
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Done
                                            </h3>
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                                5
                                            </span>
                                        </div>
                                        <MockCardDone title="User Interview Script" />
                                        <MockCardDone title="Analytics Setup" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="flex flex-col items-center justify-center gap-6 px-5 py-12 text-center border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
                <p className="text-slate-400 dark:text-slate-600 text-sm mt-4">
                    © 2025 TaskMaster. Simple project management.
                </p>
            </footer>
        </>
    )
}

/* Mock card components for the landing page visual */
function MockCard({
    label,
    labelColor,
    title,
    hasProgress = false,
    highlighted = false,
}: {
    label: string
    labelColor: string
    title: string
    hasProgress?: boolean
    highlighted?: boolean
}) {
    const colorMap: Record<string, string> = {
        purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
        blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    }

    return (
        <div
            className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm cursor-default ${highlighted
                ? "border-l-4 border-l-primary border-y border-r border-y-slate-100 border-r-slate-100 dark:border-y-slate-700 dark:border-r-slate-700 shadow-md"
                : "border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow"
                }`}
        >
            <div className="flex gap-2 mb-2">
                <span className={`${colorMap[labelColor]} text-[10px] font-bold px-2 py-0.5 rounded`}>
                    {label}
                </span>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">{title}</p>
            {hasProgress && (
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full mb-3 overflow-hidden">
                    <div className="h-full bg-primary w-2/3 rounded-full" />
                </div>
            )}
            <div className="flex items-center justify-between">
                <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-700" />
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
        </div>
    )
}

function MockCardSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm opacity-70">
            <div className="w-16 h-3 bg-slate-100 dark:bg-slate-700 rounded mb-3" />
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded mb-2" />
            <div className="w-3/4 h-3 bg-slate-100 dark:bg-slate-700 rounded mb-4" />
            <div className="flex justify-between">
                <div className="w-4 h-4 bg-slate-100 dark:bg-slate-700 rounded-full" />
                <div className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full" />
            </div>
        </div>
    )
}

function MockCardDone({ title }: { title: string }) {
    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="text-green-600 text-base">✓</span>
                <span className="text-xs text-slate-400 font-medium line-through">{title}</span>
            </div>
        </div>
    )
}
