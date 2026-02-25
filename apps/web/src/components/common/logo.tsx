import { CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps {
    size?: "sm" | "md" | "lg"
    showText?: boolean
    className?: string
}

const sizeConfig = {
    sm: { icon: "size-6", iconSize: 16, text: "text-base" },
    md: { icon: "size-8", iconSize: 20, text: "text-lg" },
    lg: { icon: "size-10", iconSize: 24, text: "text-xl" },
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
    const config = sizeConfig[size]

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div
                className={cn(
                    "flex items-center justify-center rounded-lg bg-primary/10 text-primary",
                    config.icon,
                )}
            >
                <CheckSquare size={config.iconSize} />
            </div>
            {showText && (
                <h1 className={cn("font-bold tracking-tight text-slate-900 dark:text-white", config.text)}>
                    TaskMaster
                </h1>
            )}
        </div>
    )
}
