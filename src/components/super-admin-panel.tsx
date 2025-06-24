"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Shield,
  TrendingUp,
  Users,
  Crown,
  ArrowUp,
  ArrowDown,
  UserCheck,
  UserX,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  LogOut,
  Search,
  Filter,
  Calendar,
  Mail,
  Settings,
  Database,
  Download,
  Upload,
  Trash2,
  Eye,
  Clock,
  UserPlus,
  MoreHorizontal,
  Info,
  Activity,
  Globe,
  Smartphone,
  ChevronDown,
  CheckCheck,
  X,
  Star,
  MapPin,
  Building,
  Phone,
  Link as LinkIcon,
  Heart,
  Zap,
  Target,
  Wallet,
  PlusCircle,
  MinusCircle,
  DollarSign,
  BarChart3,
  TrendingDown,
  Edit3,
  Save,
  X as XIcon,
  Award,
  PieChart,
  LineChart
} from "lucide-react"
import { TradingIcon } from "../lib/trading-icons"
import { authService, type User } from "../lib/auth"
import { useAuth } from "../lib/auth"
import { toast } from "sonner"

interface UserAnalytics {
  totalLogins: number
  lastLogin: Date | null
  activeHours: number[]
  averageSessionTime: number
  preferredDevice: 'mobile' | 'desktop' | 'tablet'
  location?: string
  ipAddress?: string
}

interface PortfolioAsset {
  id: string
  symbol: string
  name: string
  quantity: number
  buyPrice: number
  currentPrice: number
  type: 'crypto' | 'stock' | 'commodity' | 'currency' | 'sports_betting'
  addedDate: Date
}

interface UserPortfolio {
  userId: string
  assets: PortfolioAsset[]
  totalValue: number
  totalPnL: number
  lastUpdated: Date
}

interface ExtendedUser extends User {
  analytics?: UserAnalytics
  lastActive?: Date
  status: 'online' | 'offline' | 'away'
  verified: boolean
  twoFactorEnabled: boolean
  portfolio?: UserPortfolio
}

export function SuperAdminPanel() {
  const { user, isSuperAdmin } = useAuth()

  // All hooks must be called before any conditional returns
  const [allUsers, setAllUsers] = useState<ExtendedUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUser[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Enhanced search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'superadmin'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'away'>('all')
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt' | 'role' | 'lastActive' | 'status'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid')

  // Bulk action states
  const [bulkAction, setBulkAction] = useState<'promote' | 'demote' | 'delete' | 'verify' | ''>('')
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)

  // User details modal
  const [selectedUserDetails, setSelectedUserDetails] = useState<ExtendedUser | null>(null)

  // Portfolio management states
  const [portfolioManagementOpen, setPortfolioManagementOpen] = useState(false)
  const [selectedAssetToAdd, setSelectedAssetToAdd] = useState('')
  const [assetQuantity, setAssetQuantity] = useState<number>(1)
  const [assetBuyPrice, setAssetBuyPrice] = useState<number>(100)
  const [editingPortfolioUserId, setEditingPortfolioUserId] = useState<string | null>(null)

  // Available assets for portfolio management
  const availableAssets = [
    // Crypto
    { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', currentPrice: 67250 },
    { symbol: 'ETH', name: 'Ethereum', type: 'crypto', currentPrice: 2234 },
    { symbol: 'SOL', name: 'Solana', type: 'crypto', currentPrice: 98.42 },
    { symbol: 'ADA', name: 'Cardano', type: 'crypto', currentPrice: 0.3847 },
    { symbol: 'DOGE', name: 'Dogecoin', type: 'crypto', currentPrice: 0.15253 },

    // Stocks
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', currentPrice: 189.25 },
    { symbol: 'TSLA', name: 'Tesla Motors', type: 'stock', currentPrice: 248.42 },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', currentPrice: 876.34 },

    // Commodities
    { symbol: 'GOLD', name: 'Gold (Non Expiry)', type: 'commodity', currentPrice: 3379.31 },
    { symbol: 'OIL', name: 'Oil (Non Expiry)', type: 'commodity', currentPrice: 68.45 },
    { symbol: 'NATGAS', name: 'Natural Gas (Non Expiry)', type: 'commodity', currentPrice: 3.806 },

    // Currencies
    { symbol: 'EURUSD', name: 'Euro / US Dollar', type: 'currency', currentPrice: 1.15748 },
    { symbol: 'GBPUSD', name: 'British Pound / US Dollar', type: 'currency', currentPrice: 1.35254 },
    { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', type: 'currency', currentPrice: 146.096 },

    // Sports Betting
    { symbol: 'BET365', name: 'Bet365 Group Limited', type: 'sports_betting', currentPrice: 285.42 },
    { symbol: 'STAKE', name: 'Stake Sports Betting', type: 'sports_betting', currentPrice: 324.56 },
    { symbol: 'PINNACLE', name: 'Pinnacle Sports', type: 'sports_betting', currentPrice: 412.78 },
  ]

  // Portfolio management functions
  const addAssetToUserPortfolio = (userId: string, asset: PortfolioAsset) => {
    setAllUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const currentPortfolio = user.portfolio || {
          userId,
          assets: [],
          totalValue: 0,
          totalPnL: 0,
          lastUpdated: new Date()
        }

        const updatedAssets = [...currentPortfolio.assets, asset]
        const totalValue = updatedAssets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0)
        const totalPnL = updatedAssets.reduce((sum, a) => sum + ((a.currentPrice - a.buyPrice) * a.quantity), 0)

        return {
          ...user,
          portfolio: {
            ...currentPortfolio,
            assets: updatedAssets,
            totalValue,
            totalPnL,
            lastUpdated: new Date()
          }
        }
      }
      return user
    }))

    toast.success(`Added ${asset.quantity} ${asset.symbol} to user's portfolio`)
  }

  const removeAssetFromUserPortfolio = (userId: string, assetId: string) => {
    setAllUsers(prev => prev.map(user => {
      if (user.id === userId && user.portfolio) {
        const updatedAssets = user.portfolio.assets.filter(a => a.id !== assetId)
        const totalValue = updatedAssets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0)
        const totalPnL = updatedAssets.reduce((sum, a) => sum + ((a.currentPrice - a.buyPrice) * a.quantity), 0)

        return {
          ...user,
          portfolio: {
            ...user.portfolio,
            assets: updatedAssets,
            totalValue,
            totalPnL,
            lastUpdated: new Date()
          }
        }
      }
      return user
    }))

    toast.success('Asset removed from portfolio')
  }

  const handleAddAsset = () => {
    if (!editingPortfolioUserId || !selectedAssetToAdd) return

    const selectedAssetData = availableAssets.find(a => a.symbol === selectedAssetToAdd)
    if (!selectedAssetData) return

    const newAsset: PortfolioAsset = {
      id: `${selectedAssetToAdd}-${Date.now()}`,
      symbol: selectedAssetData.symbol,
      name: selectedAssetData.name,
      quantity: assetQuantity,
      buyPrice: assetBuyPrice,
      currentPrice: selectedAssetData.currentPrice,
      type: selectedAssetData.type as any,
      addedDate: new Date()
    }

    addAssetToUserPortfolio(editingPortfolioUserId, newAsset)

    // Reset form
    setSelectedAssetToAdd('')
    setAssetQuantity(1)
    setAssetBuyPrice(100)
  }

  const loadUsers = () => {
    const users = authService.getAllUsers()

    // Enhance users with mock analytics and status data
    const enhancedUsers: ExtendedUser[] = users.map(user => ({
      ...user,
      analytics: {
        totalLogins: Math.floor(Math.random() * 150) + 10,
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        activeHours: Array.from({length: 24}, () => Math.floor(Math.random() * 10)),
        averageSessionTime: Math.floor(Math.random() * 120) + 30,
        preferredDevice: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)] as 'mobile' | 'desktop' | 'tablet',
        location: ['Athens, Greece', 'Thessaloniki, Greece', 'Patras, Greece', 'Heraklion, Greece'][Math.floor(Math.random() * 4)],
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      },
      lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      status: ['online', 'offline', 'away'][Math.floor(Math.random() * 3)] as 'online' | 'offline' | 'away',
      verified: Math.random() > 0.3,
      twoFactorEnabled: Math.random() > 0.7,
      // Add mock portfolio data for some users
      portfolio: user.role === 'user' && Math.random() > 0.5 ? (() => {
        const assets = [
          {
            id: `${user.id}-btc-${Date.now()}`,
            symbol: 'BTC',
            name: 'Bitcoin',
            quantity: Math.random() * 2,
            buyPrice: 45000 + (Math.random() * 20000),
            currentPrice: 67250,
            type: 'crypto' as const,
            addedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          },
          {
            id: `${user.id}-aapl-${Date.now() + 1}`,
            symbol: 'AAPL',
            name: 'Apple Inc.',
            quantity: Math.floor(Math.random() * 50) + 5,
            buyPrice: 150 + (Math.random() * 40),
            currentPrice: 189.25,
            type: 'stock' as const,
            addedDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
          }
        ]
        const totalValue = assets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0)
        const totalPnL = assets.reduce((sum, a) => sum + ((a.currentPrice - a.buyPrice) * a.quantity), 0)

        return {
          userId: user.id,
          assets,
          totalValue,
          totalPnL,
          lastUpdated: new Date()
        }
      })() : undefined
    }))

    setAllUsers(enhancedUsers)
    setFilteredUsers(enhancedUsers)
    console.log('📊 Loaded enhanced users:', enhancedUsers.length)
  }

  // Enhanced filter and search logic
  useEffect(() => {
    let filtered = allUsers

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.analytics?.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      if (roleFilter === 'superadmin') {
        filtered = filtered.filter(u => u.id === 'superadmin-1' || u.id === 'jdgod-superadmin')
      } else {
        filtered = filtered.filter(u => u.role === roleFilter && u.id !== 'superadmin-1' && u.id !== 'jdgod-superadmin')
      }
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter)
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(u =>
        verificationFilter === 'verified' ? u.verified : !u.verified
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'lastActive':
          aValue = new Date(a.lastActive || 0).getTime()
          bValue = new Date(b.lastActive || 0).getTime()
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredUsers(filtered)
  }, [allUsers, searchTerm, roleFilter, statusFilter, verificationFilter, sortBy, sortOrder])

  useEffect(() => {
    loadUsers()
  }, [])

  const handlePromoteToAdmin = async (userId: string, userName: string) => {
    if (!confirm(`Είστε σίγουροι ότι θέλετε να αναβαθμίσετε τον/την ${userName} σε Administrator;`)) {
      return
    }

    setLoading(true)
    const result = authService.promoteToAdmin(userId)

    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      toast.success(`🚀 ${userName} αναβαθμίστηκε σε Administrator!`)
      loadUsers()
    } else {
      setMessage({ type: 'error', text: result.message })
      toast.error(result.message)
    }

    setLoading(false)
    setTimeout(() => setMessage(null), 5000)
  }

  const handleDemoteFromAdmin = async (userId: string, userName: string) => {
    if (!confirm(`Είστε σίγουροι ότι θέλετε να υποβαθμίσετε τον/την ${userName} σε κανονικό χρήστη;`)) {
      return
    }

    setLoading(true)
    const result = authService.demoteFromAdmin(userId)

    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      toast.success(`📉 ${userName} υποβαθμίστηκε σε User!`)
      loadUsers()
    } else {
      setMessage({ type: 'error', text: result.message })
      toast.error(result.message)
    }

    setLoading(false)
    setTimeout(() => setMessage(null), 5000)
  }

  // Bulk actions
  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Παρακαλώ επιλέξτε χρήστες πρώτα')
      return
    }

    if (!bulkAction) {
      toast.error('Παρακαλώ επιλέξτε μια ενέργεια')
      return
    }

    setLoading(true)
    let successCount = 0
    let errorCount = 0

    for (const userId of selectedUsers) {
      const user = allUsers.find(u => u.id === userId)
      if (!user) continue

      let result: any

      switch (bulkAction) {
        case 'promote':
          if (user.role === 'user') {
            result = authService.promoteToAdmin(userId)
            if (result.success) successCount++
            else errorCount++
          }
          break
        case 'demote':
          if (user.role === 'admin') {
            result = authService.demoteFromAdmin(userId)
            if (result.success) successCount++
            else errorCount++
          }
          break
        case 'delete':
          // Mock delete operation
          successCount++
          break
        case 'verify':
          // Mock verify operation
          successCount++
          break
      }
    }

    if (successCount > 0) {
      toast.success(`✅ ${successCount} χρήστες επεξεργάστηκαν επιτυχώς!`)
      loadUsers()
    }

    if (errorCount > 0) {
      toast.error(`❌ ${errorCount} χρήστες απέτυχαν να επεξεργαστούν`)
    }

    setSelectedUsers([])
    setBulkAction('')
    setShowBulkConfirm(false)
    setLoading(false)
  }

  // Select/deselect users
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id))
    }
  }

  // Export functions
  const handleExportUsers = () => {
    const result = authService.exportAllUsers()

    if (result.success && result.data) {
      const dataStr = JSON.stringify(result.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })

      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Users_Export_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`📥 Εξαγωγή ${result.data.totalUsers} χρηστών επιτυχής!`)
    } else {
      toast.error('Σφάλμα κατά την εξαγωγή δεδομένων')
    }
  }

  const handleClearAllUsers = () => {
    if (!confirm('ΠΡΟΣΟΧΗ: Θα διαγραφούν ΟΛΑ τα δεδομένα registered χρηστών! Συνεχίζετε;')) {
      return
    }

    if (!confirm('ΤΕΛΕΥΤΑΙΑ ΠΡΟΕΙΔΟΠΟΙΗΣΗ: Αυτή η ενέργεια δεν μπορεί να αναιρεθεί!')) {
      return
    }

    const result = authService.clearRegisteredUsers()

    if (result.success) {
      toast.success(result.message)
      loadUsers()
    } else {
      toast.error(result.message)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfigs = {
      online: { color: 'bg-green-600', icon: '🟢', text: 'Online' },
      offline: { color: 'bg-gray-600', icon: '⚫', text: 'Offline' },
      away: { color: 'bg-yellow-600', icon: '🟡', text: 'Away' }
    }
    const statusConfig = statusConfigs[status as keyof typeof statusConfigs] || statusConfigs.offline

    return (
      <Badge className={`${statusConfig.color} text-white`}>
        {statusConfig.icon} {statusConfig.text}
      </Badge>
    )
  }

  const getRoleBadge = (role: string, userId: string) => {
    if (userId === 'superadmin-1' || userId === 'jdgod-superadmin') {
      return (
        <Badge className="bg-yellow-600 text-white">
          <Crown className="mr-1 h-3 w-3" />
          SUPER ADMIN
        </Badge>
      )
    }

    return role === 'admin' ? (
      <Badge className="bg-orange-600 text-white">
        <Shield className="mr-1 h-3 w-3" />
        ADMIN
      </Badge>
    ) : (
      <Badge className="bg-blue-600 text-white">
        <Users className="mr-1 h-3 w-3" />
        USER
      </Badge>
    )
  }

  if (!authService.isSuperAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Card className="bg-red-900/30 border-red-700 max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-red-300 mb-4">Access Denied</h2>
            <p className="text-red-400 mb-6">Only Super Administrator can access this panel</p>
            <div className="space-y-2 text-sm text-red-300">
              <p>👑 Super Admin Credentials:</p>
              <p className="font-mono bg-red-900/50 p-2 rounded">Username: JDGod</p>
              <p className="font-mono bg-red-900/50 p-2 rounded">Password: Kiki1999@</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Only allow super admins to access this panel
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D1117]">
        <Card className="bg-slate-800 border-slate-700 p-8">
          <CardContent className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400">Super Administrator privileges required</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const regularUsers = filteredUsers.filter(u => u.role === 'user' && u.id !== 'superadmin-1' && u.id !== 'jdgod-superadmin')
  const admins = filteredUsers.filter(u => u.role === 'admin' && u.id !== 'superadmin-1' && u.id !== 'jdgod-superadmin')
  const superAdmins = filteredUsers.filter(u => u.id === 'superadmin-1' || u.id === 'jdgod-superadmin')
  const allRegisteredUsers = allUsers.filter(u => u.id.startsWith('registered-'))

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="text-center relative">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Crown className="h-8 w-8 text-yellow-400 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Advanced User Management
            </h1>
            <Crown className="h-8 w-8 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-slate-400 text-lg">Complete user administration & analytics dashboard</p>
          <p className="text-slate-500 text-sm mt-2">Welcome back, {user?.name} 👑</p>

          {/* Quick Navigation */}
          <div className="absolute top-0 right-0 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Trading Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => authService.logout()}
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-lg border animate-in slide-in-from-top-2 ${
            message.type === 'success'
              ? 'bg-green-900/30 border-green-700 text-green-300'
              : 'bg-red-900/30 border-red-700 text-red-300'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ?
                <UserCheck className="h-5 w-5" /> :
                <UserX className="h-5 w-5" />
              }
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Enhanced Stats Dashboard */}
        <div className="grid gap-6 md:grid-cols-6">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{allUsers.length}</div>
              <p className="text-xs text-blue-300">
                {allRegisteredUsers.length} registered
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/50 to-red-800/30 border-orange-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Admins</CardTitle>
              <Shield className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{admins.length + superAdmins.length}</div>
              <p className="text-xs text-orange-300">
                {superAdmins.length} super • {admins.length} regular
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-emerald-800/30 border-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Active</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {filteredUsers.filter(u => u.status === 'online').length}
              </div>
              <p className="text-xs text-green-300">
                Currently online
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-violet-800/30 border-purple-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Verified</CardTitle>
              <CheckCheck className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {filteredUsers.filter(u => u.verified).length}
              </div>
              <p className="text-xs text-purple-300">
                Account verified
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-amber-800/30 border-yellow-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">2FA Enabled</CardTitle>
              <Shield className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {filteredUsers.filter(u => u.twoFactorEnabled).length}
              </div>
              <p className="text-xs text-yellow-300">
                Extra secure
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-900/50 to-teal-800/30 border-cyan-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Actions</CardTitle>
              <Settings className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadUsers}
                  className="w-full border-cyan-600 text-cyan-300 hover:bg-cyan-600"
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Search and Filters */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Advanced User Search & Management</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="border-slate-600"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {showAdvancedFilters ? 'Hide' : 'Show'} Filters
                </Button>
                <Select value={viewMode} onValueChange={(value: 'grid' | 'list' | 'table') => setViewMode(value)}>
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">🔳 Grid</SelectItem>
                    <SelectItem value="list">📄 List</SelectItem>
                    <SelectItem value="table">📊 Table</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white pl-10"
              />
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid gap-4 md:grid-cols-5 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="space-y-2">
                  <Label className="text-white">Role</Label>
                  <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="superadmin">Super Admins</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                      <SelectItem value="user">Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Status</Label>
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="online">🟢 Online</SelectItem>
                      <SelectItem value="away">🟡 Away</SelectItem>
                      <SelectItem value="offline">⚫ Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Verification</Label>
                  <Select value={verificationFilter} onValueChange={(value: any) => setVerificationFilter(value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="verified">✅ Verified</SelectItem>
                      <SelectItem value="unverified">❌ Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Sort By</Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Registration Date</SelectItem>
                      <SelectItem value="lastActive">Last Active</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="role">Role</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Order</Label>
                  <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-blue-300">
                      {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUsers([])}
                      className="border-blue-600 text-blue-400 hover:bg-blue-600"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={bulkAction} onValueChange={(value: any) => setBulkAction(value)}>
                      <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Choose action..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promote">↗️ Promote to Admin</SelectItem>
                        <SelectItem value="demote">↘️ Demote to User</SelectItem>
                        <SelectItem value="verify">✅ Verify Accounts</SelectItem>
                        <SelectItem value="delete">🗑️ Delete Users</SelectItem>
                      </SelectContent>
                    </Select>
                    <AlertDialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={!bulkAction}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Apply Action
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-800 border-slate-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Confirm Bulk Action</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-400">
                            Are you sure you want to {bulkAction} {selectedUsers.length} selected user{selectedUsers.length !== 1 ? 's' : ''}?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-slate-600 text-slate-300">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleBulkAction} className="bg-red-600 hover:bg-red-700">
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-slate-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={selectAllUsers}
                  />
                  <span>Select All</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Filter className="h-4 w-4" />
                  <span>Showing {filteredUsers.length} of {allUsers.length} users</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportUsers}
                  className="border-blue-600 text-blue-400 hover:bg-blue-600"
                >
                  <Download className="mr-1 h-3 w-3" />
                  Export
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-slate-800 border-slate-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">⚠️ Danger Zone</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        This will permanently delete ALL registered user data. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-slate-600 text-slate-300">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAllUsers} className="bg-red-600 hover:bg-red-700">
                        Delete All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management Tabs */}
        <Tabs defaultValue="all-users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="all-users" className="data-[state=active]:bg-slate-700">
              All Users ({filteredUsers.length})
            </TabsTrigger>
            <TabsTrigger value="super-admins" className="data-[state=active]:bg-slate-700">
              Super Admins ({superAdmins.length})
            </TabsTrigger>
            <TabsTrigger value="admins" className="data-[state=active]:bg-slate-700">
              Admins ({admins.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-700">
              Users ({regularUsers.length})
            </TabsTrigger>
          </TabsList>

          {/* All Users Tab */}
          <TabsContent value="all-users">
            {viewMode === 'grid' && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((userData) => (
                  <Card key={userData.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Checkbox
                              checked={selectedUsers.includes(userData.id)}
                              onCheckedChange={() => toggleUserSelection(userData.id)}
                              className="absolute -top-2 -left-2 z-10"
                            />
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={userData.avatar} alt={userData.name} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${
                              userData.status === 'online' ? 'bg-green-500' :
                              userData.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg">{userData.name}</h3>
                            <p className="text-sm text-slate-400">{userData.email}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-700">
                            <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem
                              onClick={() => setSelectedUserDetails(userData)}
                              className="text-slate-300 hover:text-white hover:bg-slate-700"
                            >
                              <Info className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {userData.role === 'user' && userData.id !== 'superadmin-1' && userData.id !== 'jdgod-superadmin' && (
                              <DropdownMenuItem
                                onClick={() => handlePromoteToAdmin(userData.id, userData.name)}
                                className="text-green-400 hover:text-green-300 hover:bg-slate-700"
                              >
                                <ArrowUp className="mr-2 h-4 w-4" />
                                Promote to Admin
                              </DropdownMenuItem>
                            )}
                            {userData.role === 'admin' && (
                              <DropdownMenuItem
                                onClick={() => handleDemoteFromAdmin(userData.id, userData.name)}
                                className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                              >
                                <ArrowDown className="mr-2 h-4 w-4" />
                                Demote to User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          {getRoleBadge(userData.role, userData.id)}
                          {getStatusBadge(userData.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center space-x-1 text-slate-400">
                            <Calendar className="h-3 w-3" />
                            <span>{userData.createdAt.toLocaleDateString('el-GR')}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{userData.lastActive?.toLocaleDateString('el-GR') || 'Never'}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-slate-400">
                            <MapPin className="h-3 w-3" />
                            <span>{userData.analytics?.location || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-slate-400">
                            <Activity className="h-3 w-3" />
                            <span>{userData.analytics?.totalLogins || 0} logins</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {userData.verified && (
                            <Badge variant="outline" className="border-green-600 text-green-400 text-xs">
                              <CheckCheck className="mr-1 h-2 w-2" />
                              Verified
                            </Badge>
                          )}
                          {userData.twoFactorEnabled && (
                            <Badge variant="outline" className="border-blue-600 text-blue-400 text-xs">
                              <Shield className="mr-1 h-2 w-2" />
                              2FA
                            </Badge>
                          )}
                          {userData.id.startsWith('registered-') && (
                            <Badge variant="outline" className="border-purple-600 text-purple-400 text-xs">
                              <UserPlus className="mr-1 h-2 w-2" />
                              Registered
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredUsers.map((userData) => (
                  <Card key={userData.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Checkbox
                            checked={selectedUsers.includes(userData.id)}
                            onCheckedChange={() => toggleUserSelection(userData.id)}
                          />
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={userData.avatar} alt={userData.name} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${
                              userData.status === 'online' ? 'bg-green-500' :
                              userData.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{userData.name}</h3>
                            <p className="text-sm text-slate-400">{userData.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getRoleBadge(userData.role, userData.id)}
                            {getStatusBadge(userData.status)}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right text-sm text-slate-400">
                            <div>Joined {userData.createdAt.toLocaleDateString('el-GR')}</div>
                            <div>Last active {userData.lastActive?.toLocaleDateString('el-GR') || 'Never'}</div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUserDetails(userData)}
                              className="border-blue-600 text-blue-400 hover:bg-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingPortfolioUserId(userData.id)
                                setPortfolioManagementOpen(true)
                              }}
                              className="border-purple-600 text-purple-400 hover:bg-purple-600"
                              title="Manage Portfolio"
                            >
                              <Wallet className="h-4 w-4" />
                            </Button>
                            {userData.role === 'user' && userData.id !== 'superadmin-1' && userData.id !== 'jdgod-superadmin' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePromoteToAdmin(userData.id, userData.name)}
                                disabled={loading}
                                className="border-green-600 text-green-400 hover:bg-green-600"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                            )}
                            {userData.role === 'admin' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDemoteFromAdmin(userData.id, userData.name)}
                                disabled={loading}
                                className="border-red-600 text-red-400 hover:bg-red-600"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Super Admins Tab */}
          <TabsContent value="super-admins">
            <Card className="bg-gradient-to-r from-yellow-900/30 to-red-900/30 border-yellow-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <span>Super Administrators ({superAdmins.length})</span>
                  <Badge className="bg-yellow-600 text-white">HIGHEST PRIVILEGE</Badge>
                </CardTitle>
                <CardDescription className="text-yellow-200">
                  Users with complete system control and user management privileges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {superAdmins.map((superAdmin) => (
                    <div key={superAdmin.id} className="flex items-center justify-between p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/50">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 ring-2 ring-yellow-400">
                          <AvatarImage src={superAdmin.avatar} alt={superAdmin.name} />
                          <AvatarFallback className="bg-yellow-600 text-white font-bold">
                            {superAdmin.name.includes('JDGod') ? 'JD' : 'SA'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-white text-lg">{superAdmin.name}</div>
                          <div className="text-sm text-yellow-300 flex items-center space-x-2">
                            <Mail className="h-3 w-3" />
                            <span>{superAdmin.email}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge className="bg-yellow-600 text-white">
                              <Crown className="mr-1 h-3 w-3" />
                              SUPER ADMIN
                            </Badge>
                            <div className="text-xs text-yellow-200 flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Member since {superAdmin.createdAt.toLocaleDateString('el-GR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-yellow-300">All Privileges</div>
                        <div className="text-xs text-yellow-400">Cannot be modified</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regular Admins Tab */}
          <TabsContent value="admins">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-orange-400" />
                  <span>Administrators ({admins.length})</span>
                  <Badge className="bg-orange-600 text-white">ELEVATED PRIVILEGES</Badge>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Users with administrative privileges - can be promoted/demoted by Super Admin
                </CardDescription>
              </CardHeader>
              <CardContent>
                {admins.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg mb-2">No administrators yet</p>
                    <p className="text-slate-500 text-sm">Promote users from the section below to grant admin privileges</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {admins.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12 ring-2 ring-orange-500">
                            <AvatarImage src={admin.avatar} alt={admin.name} />
                            <AvatarFallback className="bg-orange-600 text-white font-bold">
                              {admin.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-white text-lg">{admin.name}</div>
                            <div className="text-sm text-slate-300 flex items-center space-x-2">
                              <Mail className="h-3 w-3" />
                              <span>{admin.email}</span>
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge className="bg-orange-600 text-white">
                                <Shield className="mr-1 h-3 w-3" />
                                ADMIN
                              </Badge>
                              <div className="text-xs text-slate-400 flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Registered {admin.createdAt.toLocaleDateString('el-GR')}</span>
                              </div>
                              {admin.id.startsWith('registered-') && (
                                <Badge variant="outline" className="border-green-600 text-green-400">
                                  <UserPlus className="mr-1 h-3 w-3" />
                                  Registered User
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDemoteFromAdmin(admin.id, admin.name)}
                          disabled={loading}
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          <ArrowDown className="mr-2 h-4 w-4" />
                          Demote to User
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regular Users Tab */}
          <TabsContent value="users">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <span>Regular Users ({regularUsers.length})</span>
                  <Badge className="bg-blue-600 text-white">STANDARD ACCESS</Badge>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Users with trading platform access - can be promoted to administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {regularUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg mb-2">No regular users found</p>
                    <p className="text-slate-500 text-sm">
                      {searchTerm || roleFilter !== 'all' ? 'Try adjusting your search or filter criteria' : 'Users will appear here when they register on the platform'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {regularUsers.map((userData) => (
                      <div key={userData.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-900/30 hover:bg-slate-900/60 transition-colors">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12 ring-2 ring-blue-500">
                            <AvatarImage src={userData.avatar} alt={userData.name} />
                            <AvatarFallback className="bg-blue-600 text-white font-bold">
                              {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-white text-lg">{userData.name}</div>
                            <div className="text-sm text-slate-300 flex items-center space-x-2">
                              <Mail className="h-3 w-3" />
                              <span>{userData.email}</span>
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge className="bg-blue-600 text-white">
                                <Users className="mr-1 h-3 w-3" />
                                USER
                              </Badge>
                              <div className="text-xs text-slate-400 flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Registered {userData.createdAt.toLocaleDateString('el-GR')}</span>
                              </div>
                              {userData.id.startsWith('registered-') && (
                                <Badge variant="outline" className="border-green-600 text-green-400">
                                  <UserPlus className="mr-1 h-3 w-3" />
                                  Registered User
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePromoteToAdmin(userData.id, userData.name)}
                          disabled={loading}
                          className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                        >
                          <ArrowUp className="mr-2 h-4 w-4" />
                          Promote to Admin
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Details Modal */}
        <Sheet open={!!selectedUserDetails} onOpenChange={() => setSelectedUserDetails(null)}>
          <SheetContent className="bg-slate-800 border-slate-700 w-[600px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle className="text-white flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>User Details</span>
              </SheetTitle>
              <SheetDescription className="text-slate-400">
                Complete user information and analytics
              </SheetDescription>
            </SheetHeader>

            {selectedUserDetails && (
              <div className="mt-6 space-y-6">
                {/* User Header */}
                <div className="flex items-center space-x-4 p-4 bg-slate-900/50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUserDetails.avatar} alt={selectedUserDetails.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl">
                      {selectedUserDetails.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedUserDetails.name}</h2>
                    <p className="text-slate-400">{selectedUserDetails.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getRoleBadge(selectedUserDetails.role, selectedUserDetails.id)}
                      {getStatusBadge(selectedUserDetails.status)}
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Account Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Registration Date:</span>
                        <span className="text-white">{selectedUserDetails.createdAt.toLocaleDateString('el-GR')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Last Active:</span>
                        <span className="text-white">{selectedUserDetails.lastActive?.toLocaleDateString('el-GR') || 'Never'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Total Logins:</span>
                        <span className="text-white">{selectedUserDetails.analytics?.totalLogins || 0}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Verified:</span>
                        <span className={selectedUserDetails.verified ? 'text-green-400' : 'text-red-400'}>
                          {selectedUserDetails.verified ? '✅ Yes' : '❌ No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">2FA Enabled:</span>
                        <span className={selectedUserDetails.twoFactorEnabled ? 'text-green-400' : 'text-red-400'}>
                          {selectedUserDetails.twoFactorEnabled ? '🔒 Yes' : '🔓 No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Location:</span>
                        <span className="text-white">{selectedUserDetails.analytics?.location || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Analytics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Usage Analytics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-slate-900/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{selectedUserDetails.analytics?.averageSessionTime || 0}m</div>
                          <div className="text-sm text-slate-400">Average Session</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white capitalize">{selectedUserDetails.analytics?.preferredDevice || 'Unknown'}</div>
                          <div className="text-sm text-slate-400">Preferred Device</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Portfolio Management Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Portfolio Management
                    </h3>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingPortfolioUserId(selectedUserDetails.id)
                        setPortfolioManagementOpen(true)
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </div>

                  {/* Portfolio Overview */}
                  {selectedUserDetails.portfolio && selectedUserDetails.portfolio.assets.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <Card className="bg-slate-900/50 border-slate-700">
                          <CardContent className="p-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">
                                ${selectedUserDetails.portfolio.totalValue.toFixed(2)}
                              </div>
                              <div className="text-xs text-slate-400">Total Value</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-slate-900/50 border-slate-700">
                          <CardContent className="p-3">
                            <div className="text-center">
                              <div className={`text-lg font-bold ${
                                selectedUserDetails.portfolio.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {selectedUserDetails.portfolio.totalPnL >= 0 ? '+' : ''}
                                ${selectedUserDetails.portfolio.totalPnL.toFixed(2)}
                              </div>
                              <div className="text-xs text-slate-400">Total P&L</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-slate-900/50 border-slate-700">
                          <CardContent className="p-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">
                                {selectedUserDetails.portfolio.assets.length}
                              </div>
                              <div className="text-xs text-slate-400">Assets</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Asset List */}
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedUserDetails.portfolio.assets.map((asset) => (
                          <div key={asset.id} className="flex items-center justify-between bg-slate-800/50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <TradingIcon symbol={asset.symbol} size={24} />
                              <div>
                                <div className="text-sm font-medium text-white">{asset.symbol}</div>
                                <div className="text-xs text-slate-400">{asset.quantity} units</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-white">
                                ${(asset.quantity * asset.currentPrice).toFixed(2)}
                              </div>
                              <div className={`text-xs ${
                                (asset.currentPrice - asset.buyPrice) >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {((asset.currentPrice - asset.buyPrice) * asset.quantity) >= 0 ? '+' : ''}
                                ${((asset.currentPrice - asset.buyPrice) * asset.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-400">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No portfolio assets yet</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4 border-t border-slate-700">
                  {selectedUserDetails.role === 'user' && selectedUserDetails.id !== 'superadmin-1' && selectedUserDetails.id !== 'jdgod-superadmin' && (
                    <Button
                      onClick={() => {
                        handlePromoteToAdmin(selectedUserDetails.id, selectedUserDetails.name)
                        setSelectedUserDetails(null)
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Promote to Admin
                    </Button>
                  )}
                  {selectedUserDetails.role === 'admin' && (
                    <Button
                      onClick={() => {
                        handleDemoteFromAdmin(selectedUserDetails.id, selectedUserDetails.name)
                        setSelectedUserDetails(null)
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Demote to User
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUserDetails(null)}
                    className="border-slate-600 text-slate-300"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Portfolio Management Modal */}
        <Sheet open={portfolioManagementOpen} onOpenChange={setPortfolioManagementOpen}>
          <SheetContent className="bg-slate-900 border-slate-700 max-w-2xl">
            <SheetHeader>
              <SheetTitle className="text-white flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Portfolio Management
              </SheetTitle>
              <SheetDescription className="text-slate-400">
                Add or remove assets from user's portfolio
              </SheetDescription>
            </SheetHeader>

            {editingPortfolioUserId && (
              <div className="space-y-6 mt-6">
                {/* Current Portfolio */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Current Portfolio</h3>
                  {(() => {
                    const user = allUsers.find(u => u.id === editingPortfolioUserId)
                    const portfolio = user?.portfolio

                    if (!portfolio || portfolio.assets.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-400">
                          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No assets in portfolio</p>
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-3">
                        {/* Portfolio Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <Card className="bg-slate-800 border-slate-600">
                            <CardContent className="p-4">
                              <div className="text-center">
                                <div className="text-xl font-bold text-white">
                                  ${portfolio.totalValue.toFixed(2)}
                                </div>
                                <div className="text-sm text-slate-400">Total Value</div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="bg-slate-800 border-slate-600">
                            <CardContent className="p-4">
                              <div className="text-center">
                                <div className={`text-xl font-bold ${
                                  portfolio.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {portfolio.totalPnL >= 0 ? '+' : ''}
                                  ${portfolio.totalPnL.toFixed(2)}
                                </div>
                                <div className="text-sm text-slate-400">Total P&L</div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="bg-slate-800 border-slate-600">
                            <CardContent className="p-4">
                              <div className="text-center">
                                <div className="text-xl font-bold text-white">
                                  {portfolio.assets.length}
                                </div>
                                <div className="text-sm text-slate-400">Assets</div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Assets List */}
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {portfolio.assets.map((asset) => (
                            <div key={asset.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                              <div className="flex items-center gap-3">
                                <TradingIcon symbol={asset.symbol} size={32} />
                                <div>
                                  <div className="font-medium text-white">{asset.symbol}</div>
                                  <div className="text-sm text-slate-400">{asset.name}</div>
                                  <div className="text-xs text-slate-500">
                                    {asset.quantity} units @ ${asset.buyPrice.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-medium">
                                  ${(asset.quantity * asset.currentPrice).toFixed(2)}
                                </div>
                                <div className={`text-sm ${
                                  (asset.currentPrice - asset.buyPrice) * asset.quantity >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {((asset.currentPrice - asset.buyPrice) * asset.quantity) >= 0 ? '+' : ''}
                                  ${((asset.currentPrice - asset.buyPrice) * asset.quantity).toFixed(2)}
                                </div>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeAssetFromUserPortfolio(editingPortfolioUserId, asset.id)}
                                  className="mt-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Add New Asset */}
                <div className="space-y-4 border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    Add New Asset
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Asset</Label>
                      <Select value={selectedAssetToAdd} onValueChange={setSelectedAssetToAdd}>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {availableAssets.map((asset) => (
                            <SelectItem key={asset.symbol} value={asset.symbol} className="text-white">
                              <div className="flex items-center gap-2">
                                <TradingIcon symbol={asset.symbol} size={20} />
                                <span>{asset.symbol} - {asset.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Quantity</Label>
                      <Input
                        type="number"
                        value={assetQuantity}
                        onChange={(e) => setAssetQuantity(Number(e.target.value))}
                        min="0.01"
                        step="0.01"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Buy Price ($)</Label>
                      <Input
                        type="number"
                        value={assetBuyPrice}
                        onChange={(e) => setAssetBuyPrice(Number(e.target.value))}
                        min="0.01"
                        step="0.01"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Current Price</Label>
                      <Input
                        type="text"
                        value={selectedAssetToAdd ? `${availableAssets.find(a => a.symbol === selectedAssetToAdd)?.currentPrice.toFixed(2) || '0.00'}` : '$0.00'}
                        disabled
                        className="bg-slate-700 border-slate-600 text-slate-400"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddAsset}
                    disabled={!selectedAssetToAdd || assetQuantity <= 0 || assetBuyPrice <= 0}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Asset to Portfolio
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Footer Info */}
        <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
          <CardContent className="p-4">
            <div className="text-center text-slate-400">
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Database className="h-4 w-4" />
                  <span>Storage: localStorage</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {new Date().toLocaleTimeString('el-GR')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>Version: v98 Enhanced</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                🛡️ Advanced Super Administrator Panel - Complete user management & analytics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
