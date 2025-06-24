"use client"

import { AuthProvider } from "../../lib/auth"
import { LoginForm } from "@/components/auth/login-form"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "sonner"
import { useRouter } from "next/navigation"
import { BarChart3 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  const handleLoginSuccess = () => {
    // Redirect to home after successful login
    router.push('/')
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950">
        {/* Simple header for login page */}
        <div className="p-4 border-b border-slate-700 bg-slate-900">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-white">
              <BarChart3 className="h-6 w-6" />
              <span className="text-lg">TradingPro</span>
            </div>
            <div className="text-slate-400 text-sm">Sign in to continue</div>
          </div>
        </div>
        <ErrorBoundary>
          <LoginForm onSuccess={handleLoginSuccess} />
        </ErrorBoundary>
        <Toaster richColors position="top-right" />
      </div>
    </AuthProvider>
  )
}
