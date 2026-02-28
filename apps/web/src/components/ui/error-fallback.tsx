import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FallbackProps } from "react-error-boundary"

export function GlobalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 text-center bg-background-light dark:bg-background-dark rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-6">
                <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mb-2">
                Terjadi Kesalahan pada Tampilan
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 whitespace-pre-wrap">
                {(error as Error).message || "Komponen ini gagal dimuat karena kesalahan internal. Silakan muat ulang halaman atau coba lagi."}
            </p>
            <Button onClick={resetErrorBoundary} variant="outline" className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Coba Lagi
            </Button>
        </div>
    )
}
