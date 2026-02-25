// Workspace & Board types
export interface Workspace {
    id: string
    name: string
    description?: string
    icon?: string
    createdAt: string
    updatedAt: string
    members: Member[]
}

export interface Board {
    id: string
    workspaceId: string
    name: string
    color: string // top accent color
    status: "active" | "in-review" | "planning" | "archived"
    columns: Column[]
    members: Member[]
    createdAt: string
    updatedAt: string
}

export interface Column {
    id: string
    boardId: string
    name: string
    color: string // dot color
    position: number
    tasks: Task[]
}

export interface Task {
    id: string
    columnId: string
    title: string
    description?: string
    position: number
    labels: Label[]
    assignees: Member[]
    dueDate?: string
    commentsCount: number
    attachmentsCount: number
    completed: boolean
    createdAt: string
    updatedAt: string
}

export interface Label {
    id: string
    name: string
    color: string // e.g. "red", "blue", "purple", "orange"
}

export interface Member {
    id: string
    name: string
    email: string
    avatarUrl?: string
    initials: string
    color: string // avatar bg color
    online?: boolean
}

export interface Comment {
    id: string
    taskId: string
    author: Member
    content: string
    createdAt: string
    updatedAt: string
}

export interface ActivityItem {
    id: string
    type: "update" | "complete" | "member_added" | "comment"
    icon: string
    iconColor: string
    message: string
    timestamp: string
}
