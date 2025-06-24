"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ErrorBoundary } from "@/components/error-boundary"
import { AuthProvider, useAuth } from "../lib/auth"
import { LoginForm } from "@/components/auth/login-form"
import { SharedNavigation } from "@/components/shared-navigation"
import { Toaster } from "sonner"
import { RealTimeMarketBanner } from "@/components/real-time-market-banner"
import { LiveFootballScores } from "@/components/live-football-scores"
import {
  TrendingUp,
  Activity,
  Settings,
  Plus,
  Download,
  DollarSign,
  Eye,
  Briefcase,
  ChevronRight,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Home Dashboard Component
function HomeDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const NavigationCard = ({
    title,
    description,
    icon: Icon,
    href,
    color = "blue",
    stats
  }: {
    title: string
    description: string
    icon: any
    href: string
    color?: string
    stats?: string
  }) => (
    <Card
      className={`bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer group`}
      onClick={() => router.push(href)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            color === 'blue' ? 'bg-blue-600' :
            color === 'green' ? 'bg-green-600' :
            color === 'orange' ? 'bg-orange-600' :
            color === 'purple' ? 'bg-purple-600' :
            'bg-blue-600'
          }`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-white">{title}</CardTitle>
            <CardDescription className="text-slate-400">{description}</CardDescription>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
      </CardHeader>
      {stats && (
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats}</div>
        </CardContent>
      )}
    </Card>
  )

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <SharedNavigation />

      {/* Market Banners */}
      <ErrorBoundary>
        <RealTimeMarketBanner />
      </ErrorBoundary>
      <ErrorBoundary>
        <LiveFootballScores />
      </ErrorBoundary>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🏠 Welcome to TradingPro</h1>
          <p className="text-slate-400 text-lg">Your comprehensive trading and investment platform</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$25,847.32</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">+7.68%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Watchlist Items</CardTitle>
              <Eye className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">47</div>
              <div className="text-xs text-slate-400">Assets tracked</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Active Positions</CardTitle>
              <Briefcase className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-xs text-slate-400">Open trades</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Daily P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">+$1,247.55</div>
              <div className="text-xs text-slate-400">+4.83% today</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <NavigationCard
            title="📊 Watchlist"
            description="Monitor your favorite assets and markets"
            icon={Eye}
            href="/watchlist"
            color="blue"
            stats="47 Assets"
          />

          <NavigationCard
            title="💼 Portfolio"
            description="Track your investments and P&L performance"
            icon={Briefcase}
            href="/portfolio"
            color="green"
            stats="$25,847.32"
          />

          {/* Admin Navigation - Only for admins */}
          {user?.role === 'admin' && (
            <NavigationCard
              title="👨‍💼 Admin Panel"
              description="Manage users and system settings"
              icon={Shield}
              href="/admin"
              color="purple"
              stats="System Admin"
            />
          )}
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-slate-400">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white h-12"
                onClick={() => router.push('/watchlist')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Watchlist
              </Button>

              <Button
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700 h-12"
                onClick={() => router.push('/portfolio')}
              >
                <Activity className="mr-2 h-4 w-4" />
                View Portfolio
              </Button>

              <Button
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700 h-12"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>

              <Button
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700 h-12"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// Main App Component with Authentication Check
function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  console.log('🔄 HomePage AppContent - User details:', {
    userId: user?.id,
    userRole: user?.role,
    userName: user?.name,
    isAuthenticated,
    isLoading
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page if not authenticated
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white">Redirecting to login...</div>
      </div>
    )
  }

  // Render the home dashboard for authenticated users
  console.log('🏠 Rendering HomeDashboard')
  return (
    <ErrorBoundary>
      <HomeDashboard />
    </ErrorBoundary>
  )
}

// Root component with providers
export default function HomePage() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  )
}
