import winston from "winston"
import { env } from "../env.js"

const { combine, timestamp, printf, colorize, errors, json } = winston.format

// Custom format for console output
const consoleFormat = combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    printf(({ level, message, timestamp, stack }) => {
        if (stack) {
            return `[${timestamp}] ${level}: ${message}\n${stack}`
        }
        return `[${timestamp}] ${level}: ${message}`
    }),
)

export const logger = winston.createLogger({
    level: env.NODE_ENV === "development" ? "debug" : "info",
    format: combine(
        errors({ stack: true }),
        env.NODE_ENV === "development" ? consoleFormat : json(),
    ),
    transports: [
        new winston.transports.Console(),
        // Add file transports here for production if needed
        // new winston.transports.File({ filename: "error.log", level: "error" }),
        // new winston.transports.File({ filename: "combined.log" }),
    ],
})
