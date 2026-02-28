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
        if (error.response) {
            const status = error.response.status

            // Handle 401 Unauthorized globally
            if (status === 401) {
                // If it's a get-session call, we don't want to spam redirects.
                // The ProtectedRoute component will handle redirecting if user is null.
                if (!error.config.url?.includes("/auth/get-session")) {
                    console.warn("[Global API] 401 Unauthorized intercepted.")
                    // Optional: Dispatch a custom event to force a redirect in React
                    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
                }
            }

            // Handle 500 Internal Server Error globally
            if (status >= 500) {
                console.error("[Global API] Server error intercepted.", error.response.data)
                // We dispatch an event so our React components (like Toaster) can capture it
                window.dispatchEvent(
                    new CustomEvent('api:error', {
                        detail: { message: "Terjadi kesalahan pada server. Silakan coba lagi." }
                    })
                )
            }
        } else if (error.request) {
            // Network error (no response received)
            window.dispatchEvent(
                new CustomEvent('api:error', {
                    detail: { message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda." }
                })
            )
        }

        return Promise.reject(error)
    },
)
