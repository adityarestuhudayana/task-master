import { io, type Socket } from "socket.io-client"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

let socket: Socket | null = null

export function getSocket(): Socket {
    if (!socket) {
        socket = io(API_URL, {
            autoConnect: false,
            transports: ["websocket", "polling"],
        })
    }
    return socket
}

export function connectSocket(token?: string) {
    const s = getSocket()
    if (token) {
        s.auth = { token }
    }
    s.connect()
    return s
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

// Event helpers
export function onBoardUpdate(callback: (data: unknown) => void) {
    const s = getSocket()
    s.on("board:update", callback)
    return () => {
        s.off("board:update", callback)
    }
}

export function onTaskMove(callback: (data: { taskId: string; fromColumn: string; toColumn: string; position: number }) => void) {
    const s = getSocket()
    s.on("task:move", callback)
    return () => {
        s.off("task:move", callback)
    }
}

export function emitTaskMove(data: { taskId: string; fromColumn: string; toColumn: string; position: number }) {
    const s = getSocket()
    s.emit("task:move", data)
}

export function joinBoard(boardId: string) {
    const s = getSocket()
    s.emit("board:join", { boardId })
}

export function leaveBoard(boardId: string) {
    const s = getSocket()
    s.emit("board:leave", { boardId })
}
