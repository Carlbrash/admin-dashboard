"use client"

import { AuthProvider, useAuth } from "../../../lib/auth"
import { SharedNavigation } from "@/components/shared-navigation"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { SuperAdminPanel } from "@/components/super-admin-panel"

function PortfolioUsersListContent() {
  const { user, isSuperAdmin } = useAuth()
  const router = useRouter()

  // Only allow super admins to access this page
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D1117]">
        <Card className="bg-slate-800 border-slate-700 p-8 max-w-md text-center">
          <CardContent>
            <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400 mb-4">Super Administrator privileges required to access Portfolio Management</p>
            <Button
              onClick={() => router.push('/portfolio')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <SharedNavigation />
      <div className="p-4 border-b border-slate-700 bg-slate-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">💼 Portfolio Management - Users List</h1>
            <p className="text-slate-400">Manage all users' portfolios, add/remove assets, and track investments</p>
          </div>
          <Button
            onClick={() => router.push('/portfolio')}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>
        </div>
      </div>

      <ErrorBoundary>
        <SuperAdminPanel />
      </ErrorBoundary>
    </div>
  )
}

export default function PortfolioUsersListPage() {
  return (
    <AuthProvider>
      <PortfolioUsersListContent />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  )
}
