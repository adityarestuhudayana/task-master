import { httpServer, io } from "./app.js"
import { client } from "./db/index.js"
import { env } from "./env.js"
import "dotenv/config"

const PORT = Number(process.env.PORT) || 3000

const server = httpServer.listen(PORT, () => {
    console.log(`🚀 TaskMaster API running on http://localhost:${PORT}`)
    console.log(`📡 WebSocket server ready`)
    console.log(`🔑 Better Auth at ${env.BETTER_AUTH_URL}/api/auth`)
})

// Graceful Shutdown Options
const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received. Closing server gracefully...`)

    // 1. Stop receiving new HTTP connections
    server.close(async () => {
        console.log("Http server closed.")

        try {
            // 2. Shut down Socket.io
            if (io) {
                console.log("Closing Socket.io connections...")
                io.close()
            }

            // 3. Close Database connection pool
            console.log("Closing Database connections...")
            await client.end()

            console.log("All connections closed. Exiting process.")
            process.exit(0)
        } catch (err) {
            console.error("Error during shutdown", err)
            process.exit(1)
        }
    })

    // Force shutdown after 10s if graceful fails
    setTimeout(() => {
        console.error("Could not close connections in time, forcefully shutting down")
        process.exit(1)
    }, 10000)
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))
