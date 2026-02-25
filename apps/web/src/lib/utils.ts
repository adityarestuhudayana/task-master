import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getUserColor(name: string) {
    const colors = [
        "bg-blue-500",
        "bg-emerald-500",
        "bg-indigo-500",
        "bg-violet-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-rose-500",
        "bg-orange-500",
        "bg-amber-500",
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
}
