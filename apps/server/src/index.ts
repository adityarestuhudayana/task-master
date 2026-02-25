import { httpServer } from "./app.js"
import "dotenv/config"

const PORT = Number(process.env.PORT) || 3000

httpServer.listen(PORT, () => {
    console.log(`🚀 TaskMaster API running on http://localhost:${PORT}`)
    console.log(`📡 WebSocket server ready`)
    console.log(`🔑 Better Auth at http://localhost:${PORT}/api/auth`)
})
