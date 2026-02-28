import { useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useThemeStore, applyTheme } from "@/stores/theme-store"
import { PublicLayout } from "@/components/layout/public-layout"
import { AuthLayout } from "@/components/layout/auth-layout"
import { AppLayout } from "@/components/layout/app-layout"
import { LandingPage } from "@/pages/landing"
import { LoginPage } from "@/pages/login"
import { SignupPage } from "@/pages/signup"
import { DashboardPage } from "@/pages/dashboard"
import { JoinWorkspacePage } from "@/pages/join"
import { BoardPage } from "@/pages/board"
import { SettingsPage } from "@/pages/settings"
import { NotFoundPage } from "@/pages/not-found"
import { WorkspacePage } from "@/pages/workspace"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { PublicRoute } from "@/components/auth/public-route"
import { useCurrentUser } from "@/hooks/use-auth"
import { connectSocket, disconnectSocket } from "@/lib/socket"
import { toast } from "sonner"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

function ThemeInitializer() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    applyTheme(theme)
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = () => applyTheme("system")
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  }, [theme])

  return null
}

function SocketManager() {
  const { data: user } = useCurrentUser()

  useEffect(() => {
    if (user) {
      connectSocket()
    } else {
      disconnectSocket()
    }
  }, [user])

  return null
}

function GlobalErrorHandler() {
  useEffect(() => {
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent
      toast.error(customEvent.detail.message || "Terjadi kesalahan pada server")
    }

    const handleUnauthorized = () => {
      // Force reload to login page if unauthorized
      if (window.location.pathname !== "/login" && window.location.pathname !== "/signup" && window.location.pathname !== "/") {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      }
    }

    window.addEventListener("api:error", handleApiError)
    window.addEventListener("auth:unauthorized", handleUnauthorized)

    return () => {
      window.removeEventListener("api:error", handleApiError)
      window.removeEventListener("auth:unauthorized", handleUnauthorized)
    }
  }, [])

  return null
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <SocketManager />
      <GlobalErrorHandler />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
            </Route>

            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
            </Route>
          </Route>

          {/* Protected app routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="w/:workspaceId" element={<WorkspacePage />} />
              <Route path="w/:workspaceId/b/:boardId" element={<BoardPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="/join/:inviteCode" element={<JoinWorkspacePage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
