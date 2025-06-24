"use client"

import { AuthProvider } from "../../lib/auth"
import { UserTradingDashboard } from "@/components/user-trading-dashboard"
import { SharedNavigation } from "@/components/shared-navigation"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "sonner"

export default function WatchlistPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0D1117]">
        <SharedNavigation />
        <div className="p-4 border-b border-slate-700 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-white">📊 Watchlist - Trading Dashboard</h1>
            <p className="text-slate-400">Monitor your favorite assets and make trading decisions</p>
          </div>
        </div>
        <ErrorBoundary>
          <UserTradingDashboard />
        </ErrorBoundary>
        <Toaster richColors position="top-right" />
      </div>
    </AuthProvider>
  )
}
