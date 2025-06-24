"use client"

import { AuthProvider, useAuth } from "../../lib/auth"
import { SharedNavigation } from "@/components/shared-navigation"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Users, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

function PortfolioContent() {
  const { user, isSuperAdmin } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <SharedNavigation />
      <div className="p-4 border-b border-slate-700 bg-slate-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">💼 Portfolio - My Investments</h1>
            <p className="text-slate-400">Track your positions, P&L, and investment performance</p>
          </div>

          {/* Super Admin Portfolio Management Button */}
          {isSuperAdmin && (
            <Button
              onClick={() => router.push('/portfolio/userslist')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users Portfolios
            </Button>
          )}
        </div>
      </div>

        <div className="max-w-7xl mx-auto p-6">
          <ErrorBoundary>
            {/* Portfolio Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">$25,847.32</div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">+7.68%</span>
                    <span className="text-slate-400 ml-1">this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">P&L Today</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">+$1,247.55</div>
                  <div className="text-xs text-slate-400">+4.83% today</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Available Cash</CardTitle>
                  <DollarSign className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">$2,847.32</div>
                  <div className="text-xs text-slate-400">Ready to invest</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Positions</CardTitle>
                  <Briefcase className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-xs text-slate-400">Active investments</div>
                </CardContent>
              </Card>
            </div>

            {/* Positions Table */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">My Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400 text-center py-8">
                  📈 Portfolio positions will be displayed here
                  <br />
                  <span className="text-sm">Currently showing mock data - integrate with real portfolio API</span>
                </div>
              </CardContent>
            </Card>
          </ErrorBoundary>
        </div>

        <Toaster richColors position="top-right" />
      </div>
    )
}

export default function PortfolioPage() {
  return (
    <AuthProvider>
      <PortfolioContent />
    </AuthProvider>
  )
}
