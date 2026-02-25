import { cn } from "@/lib/utils"

interface UserAvatarProps {
    name: string
    initials: string
    avatarUrl?: string
    color?: string
    size?: "sm" | "md" | "lg"
    showOnline?: boolean
    online?: boolean
    className?: string
}

const sizeClasses = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
}

export function UserAvatar({
    name,
    initials,
    avatarUrl,
    color = "bg-primary/20 text-primary",
    size = "md",
    showOnline = false,
    online = false,
    className,
}: UserAvatarProps) {
    return (
        <div className={cn("relative inline-flex rounded-full", className)} title={name}>
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={name}
                    className={cn(
                        "rounded-full object-cover border border-slate-200 dark:border-slate-700",
                        sizeClasses[size],
                    )}
                />
            ) : (
                <div
                    className={cn(
                        "rounded-full flex items-center justify-center font-semibold text-white",
                        color,
                        sizeClasses[size],
                    )}
                >
                    {initials}
                </div>
            )}
            {showOnline && online && (
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900" />
            )}
        </div>
    )
}
