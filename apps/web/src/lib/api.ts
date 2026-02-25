import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || ""

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

// Request interceptor for auth token
api.interceptors.request.use((config) => {
    // Token will be handled by Better Auth cookies (withCredentials)
    return config
})

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // We handle 401s in specific hooks/guards now instead of hard-redirecting
        // which was causing the login page to refresh itself on error.
        return Promise.reject(error)
    },
)
