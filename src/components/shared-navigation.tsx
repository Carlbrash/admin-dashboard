"use client"

import { useRouter, usePathname } from "next/navigation"
import { useAuth, authService } from "../lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  BarChart3,
  Search,
  Bell,
  LogOut,
  Home,
  Eye,
  Briefcase,
  Shield,
  User
} from "lucide-react"

export function SharedNavigation() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await authService.logout()
  }

  const NavigationItem = ({
    href,
    icon: Icon,
    label,
    isActive
  }: {
    href: string
    icon: any
    label: string
    isActive: boolean
  }) => (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={`justify-start text-white hover:text-white hover:bg-slate-700 h-11 ${
        isActive ? 'bg-slate-700' : ''
      }`}
      onClick={() => router.push(href)}
    >
      <Icon className="mr-3 h-5 w-5" />
      {label}
    </Button>
  )

  return (
    <header className="flex h-16 items-center gap-4 border-b border-slate-800 bg-[#1A1D29] px-4 lg:px-6 sticky top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-semibold text-white cursor-pointer" onClick={() => router.push('/')}>
          <BarChart3 className="h-6 w-6" />
          <span className="text-lg">TradingPro</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-2 ml-8">
        <NavigationItem
          href="/"
          icon={Home}
          label="Home"
          isActive={pathname === '/'}
        />

        <NavigationItem
          href="/watchlist"
          icon={Eye}
          label="Watchlist"
          isActive={pathname === '/watchlist'}
        />

        <NavigationItem
          href="/portfolio"
          icon={Briefcase}
          label="Portfolio"
          isActive={pathname === '/portfolio'}
        />

        <NavigationItem
          href="/profile"
          icon={User}
          label="Profile"
          isActive={pathname === '/profile'}
        />

        {/* Admin link - only for admins and super admins */}
        {(user?.role === 'admin' || user?.role === 'superadmin') && (
          <NavigationItem
            href="/admin"
            icon={Shield}
            label="Admin"
            isActive={pathname === '/admin'}
          />
        )}
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md ml-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search markets, assets..."
            className="w-full bg-slate-800 border-slate-600 text-white placeholder-slate-400 pl-10 pr-4 h-10 rounded-lg"
          />
        </div>
      </div>

      {/* Right Side - Notifications & User Menu */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 w-56">
            <DropdownMenuLabel className="text-white">
              {user?.name}
              <div className="text-xs text-slate-400 font-normal">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-600" />

            {/* Quick Navigation in Menu */}
            <DropdownMenuItem className="text-white hover:bg-slate-700" onClick={() => router.push('/')}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-slate-700" onClick={() => router.push('/watchlist')}>
              <Eye className="mr-2 h-4 w-4" />
              Watchlist
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-slate-700" onClick={() => router.push('/portfolio')}>
              <Briefcase className="mr-2 h-4 w-4" />
              Portfolio
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-slate-700" onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>

            {user?.role === 'admin' && (
              <DropdownMenuItem className="text-white hover:bg-slate-700" onClick={() => router.push('/admin')}>
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-slate-600" />
            <DropdownMenuItem className="text-white hover:bg-slate-700" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
