import { Link } from "react-router-dom"
import { CheckCircle, SearchX, LayoutDashboard } from "lucide-react"

export function NotFoundPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
            {/* Header */}
            <header className="w-full px-8 py-6 absolute top-0 left-0">
                <div className="max-w-7xl mx-auto flex justify-start">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="flex items-center justify-center size-8 rounded bg-primary text-white shadow-sm">
                            <CheckCircle size={20} />
                        </div>
                        <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                            TaskMaster
                        </h1>
                    </Link>
                </div>
            </header>

            {/* Main */}
            <main className="flex-grow flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-2xl flex flex-col items-center text-center">
                    {/* Hero 404 */}
                    <div className="relative z-10 select-none">
                        <h2 className="text-[120px] sm:text-[180px] font-black leading-none text-slate-200 dark:text-slate-700/50 tracking-tighter">
                            404
                        </h2>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/10 dark:text-primary/20 pointer-events-none">
                            <SearchX size={140} />
                        </div>
                    </div>

                    {/* Error Message */}
                    <div className="mt-2 space-y-4">
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                            Oops! We can't find that page.
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                            It looks like the task you are looking for has been completed or
                            moved. Let's get you back on track.
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="mt-10">
                        <Link
                            to="/dashboard"
                            className="bg-primary hover:bg-primary/90 transition-colors text-white font-medium text-base h-12 px-8 rounded-lg shadow-sm shadow-primary/30 flex items-center gap-2"
                        >
                            <LayoutDashboard size={18} />
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-6 text-center text-slate-400 dark:text-slate-600 text-sm">
                <p>© 2025 TaskMaster. All rights reserved.</p>
            </footer>
        </div>
    )
}
