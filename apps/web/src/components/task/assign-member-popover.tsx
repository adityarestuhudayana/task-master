import { useState } from "react"
import { Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const allMembers = [
    { id: "1", name: "Alex Smith", email: "alex@taskmaster.com", initials: "AS", assigned: true },
    { id: "2", name: "Jordan Doe", email: "jordan@taskmaster.com", initials: "JD", assigned: false },
    { id: "3", name: "Kim Roberts", email: "kim@taskmaster.com", initials: "KR", assigned: false },
    { id: "4", name: "Taylor Chen", email: "taylor@taskmaster.com", initials: "TC", assigned: false },
    { id: "5", name: "Morgan Lee", email: "morgan@taskmaster.com", initials: "ML", assigned: false },
]

interface AssignMemberPopoverProps {
    onClose: () => void
}

export function AssignMemberPopover({ onClose }: AssignMemberPopoverProps) {
    const [search, setSearch] = useState("")
    const [members, setMembers] = useState(allMembers)

    const filtered = members.filter(
        (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()),
    )

    const toggleAssign = (id: string) => {
        setMembers((prev) =>
            prev.map((m) => (m.id === id ? { ...m, assigned: !m.assigned } : m)),
        )
    }

    return (
        <>
            {/* Invisible click-away overlay */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            <div className="absolute top-full left-0 mt-2 z-50 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Search */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search members..."
                            autoFocus
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                        />
                    </div>
                </div>

                {/* Members list */}
                <div className="max-h-48 overflow-y-auto custom-scrollbar py-1">
                    {filtered.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-slate-400 text-center">
                            No members found
                        </p>
                    ) : (
                        filtered.map((member) => (
                            <button
                                key={member.id}
                                onClick={() => toggleAssign(member.id)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                            >
                                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {member.initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {member.name}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                        {member.email}
                                    </p>
                                </div>
                                <div
                                    className={cn(
                                        "w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors",
                                        member.assigned
                                            ? "bg-primary text-white"
                                            : "border border-slate-300 dark:border-slate-600",
                                    )}
                                >
                                    {member.assigned && <Check size={12} />}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}
