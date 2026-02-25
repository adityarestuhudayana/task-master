import type { Member } from "@/types"
import { UserAvatar } from "./user-avatar"
import { cn } from "@/lib/utils"

interface AvatarGroupProps {
    members: Member[]
    max?: number
    size?: "sm" | "md"
    className?: string
}

export function AvatarGroup({ members, max = 3, size = "sm", className }: AvatarGroupProps) {
    const visible = members.slice(0, max)
    const remaining = members.length - max

    return (
        <div className={cn("flex -space-x-1.5", className)}>
            {visible.map((member, index) => (
                <div
                    key={member.id}
                    className="transition-transform hover:-translate-y-1 hover:z-10"
                    style={{ zIndex: visible.length - index }}
                >
                    <UserAvatar
                        name={member.name}
                        initials={member.initials}
                        avatarUrl={member.avatarUrl}
                        color={member.color}
                        size={size}
                        className="ring-2 ring-white dark:ring-surface-dark"
                    />
                </div>
            ))}
            {remaining > 0 && (
                <div
                    className={cn(
                        "rounded-full ring-2 ring-white dark:ring-surface-dark bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-semibold text-slate-600 dark:text-slate-300 relative z-0",
                        size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs",
                    )}
                >
                    +{remaining}
                </div>
            )}
        </div>
    )
}
