"use client"

import { AuthProvider } from "../../lib/auth"
import { SharedNavigation } from "@/components/shared-navigation"
import { SuperAdminPanel } from "@/components/super-admin-panel"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "sonner"

export default function AdminPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950">
        <SharedNavigation />
        <div className="p-4 border-b border-slate-700 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-white">👨‍💼 Admin Panel - System Management</h1>
            <p className="text-slate-400">Manage users, monitor system, and configure settings</p>
          </div>
        </div>
        <ErrorBoundary>
          <SuperAdminPanel />
        </ErrorBoundary>
        <Toaster richColors position="top-right" />
      </div>
    </AuthProvider>
  )
}
