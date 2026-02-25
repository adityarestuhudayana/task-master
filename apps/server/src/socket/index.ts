import type { Server } from "socket.io"
import type { Server as HttpServer } from "http"
import { Server as SocketServer } from "socket.io"

export function setupSocketIO(httpServer: HttpServer): Server {
    const io = new SocketServer(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:5173",
            credentials: true,
        },
        transports: ["websocket", "polling"],
    })

    io.on("connection", (socket) => {

        // Join a board room
        socket.on("board:join", ({ boardId }: { boardId: string }) => {
            socket.join(`board:${boardId}`)
        })

        // Leave a board room
        socket.on("board:leave", ({ boardId }: { boardId: string }) => {
            socket.leave(`board:${boardId}`)
        })

        // Task move — broadcast to other users in the same board
        socket.on(
            "task:move",
            (data: {
                taskId: string
                fromColumn: string
                toColumn: string
                position: number
                boardId?: string
            }) => {
                // Broadcast to all rooms the socket is in (board rooms)
                for (const room of socket.rooms) {
                    if (room.startsWith("board:")) {
                        socket.to(room).emit("task:move", data)
                    }
                }
            },
        )

        socket.on("disconnect", (reason) => {
        })

        socket.on("error", (err) => {
            console.error(`[Socket] ❌ Error for ${socket.id}:`, err)
        })
    })

    return io
}

// Helper: broadcast a board update from route handlers
export function broadcastBoardUpdate(
    io: Server,
    boardId: string,
    type: string,
    data: unknown,
) {
    io.to(`board:${boardId}`).emit("board:update", { type, data })
}
