export const LABEL_COLORS = [
    { name: "red", css: "bg-red-500" },
    { name: "orange", css: "bg-orange-500" },
    { name: "yellow", css: "bg-yellow-500" },
    { name: "green", css: "bg-green-500" },
    { name: "blue", css: "bg-blue-500" },
    { name: "indigo", css: "bg-indigo-500" },
    { name: "purple", css: "bg-purple-500" },
    { name: "pink", css: "bg-pink-500" },
]

export const getLabelColorClasses = (color: string) => {
    const map: Record<string, string> = {
        red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
        orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
        yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
        green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
        blue: "bg-blue-100 dark:bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
        purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
        pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
        slate: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
    }
    return map[color] || map.slate
}
