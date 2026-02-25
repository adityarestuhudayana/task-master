import { useEffect } from "react"
import { useThemeStore, applyTheme } from "@/stores/theme-store"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

const options = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
]

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useThemeStore()

    useEffect(() => {
        applyTheme(theme)

        if (theme === "system") {
            const mq = window.matchMedia("(prefers-color-scheme: dark)")
            const handler = () => applyTheme("system")
            mq.addEventListener("change", handler)
            return () => mq.removeEventListener("change", handler)
        }
    }, [theme])

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1",
                className,
            )}
        >
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    title={opt.label}
                    className={cn(
                        "rounded-md p-1.5 transition-colors",
                        theme === opt.value
                            ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                    )}
                >
                    <opt.icon size={16} />
                </button>
            ))}
        </div>
    )
}
