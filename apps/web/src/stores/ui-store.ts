import { create } from "zustand"

interface UIStore {
    // Sidebar
    sidebarOpen: boolean
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void

    // Modals
    createWorkspaceOpen: boolean
    setCreateWorkspaceOpen: (open: boolean) => void

    createBoardOpen: boolean
    setCreateBoardOpen: (open: boolean) => void

    boardSettingsOpen: boolean
    boardSettingsId: string | null
    openBoardSettings: (id: string) => void
    closeBoardSettings: () => void

    workspaceSettingsOpen: boolean
    workspaceSettingsId: string | null
    openWorkspaceSettings: (id: string) => void
    closeWorkspaceSettings: () => void

    taskDetailOpen: boolean
    taskDetailId: string | null
    openTaskDetail: (id: string) => void
    closeTaskDetail: () => void

    // Create Task Modal
    createTaskOpen: boolean
    createTaskColumnId: string | null
    setCreateTaskOpen: (open: boolean) => void
    openCreateTask: (columnId: string) => void

    // Invite Members Modal
    inviteMembersOpen: boolean
    inviteMembersId: string | null
    openInviteMembers: (id: string) => void
    closeInviteMembers: () => void
}

export const useUIStore = create<UIStore>((set) => ({
    // Sidebar
    sidebarOpen: false,
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    // Create Workspace Modal
    createWorkspaceOpen: false,
    setCreateWorkspaceOpen: (open) => set({ createWorkspaceOpen: open }),

    // Create Board Modal
    createBoardOpen: false,
    setCreateBoardOpen: (open) => set({ createBoardOpen: open }),

    // Board Settings Modal
    boardSettingsOpen: false,
    boardSettingsId: null,
    openBoardSettings: (id) =>
        set({ boardSettingsOpen: true, boardSettingsId: id }),
    closeBoardSettings: () =>
        set({ boardSettingsOpen: false, boardSettingsId: null }),

    // Workspace Settings Modal
    workspaceSettingsOpen: false,
    workspaceSettingsId: null,
    openWorkspaceSettings: (id) =>
        set({ workspaceSettingsOpen: true, workspaceSettingsId: id }),
    closeWorkspaceSettings: () =>
        set({ workspaceSettingsOpen: false, workspaceSettingsId: null }),

    // Task Detail Modal
    taskDetailOpen: false,
    taskDetailId: null,
    openTaskDetail: (id) => set({ taskDetailOpen: true, taskDetailId: id }),
    closeTaskDetail: () => set({ taskDetailOpen: false, taskDetailId: null }),

    // Create Task Modal
    createTaskOpen: false,
    createTaskColumnId: null,
    setCreateTaskOpen: (open) => set({ createTaskOpen: open }),
    openCreateTask: (columnId) =>
        set({ createTaskOpen: true, createTaskColumnId: columnId }),

    // Invite Members Modal
    inviteMembersOpen: false,
    inviteMembersId: null,
    openInviteMembers: (id) => set({ inviteMembersOpen: true, inviteMembersId: id }),
    closeInviteMembers: () => set({ inviteMembersOpen: false, inviteMembersId: null }),
}))
