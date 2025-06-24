"use client"

import { useState, useEffect, memo, useMemo, useCallback } from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Star,
  Search,
  Menu,
  LogOut,
  User,
  Settings,
  Bell,
  Briefcase,
  Activity,
  BarChart3,
  PlusCircle,
  MinusCircle,
  Clock,
  AlertCircle,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  Grid3X3,
  List,
  Zap,
  Target,
  Shield,
  ChevronDown,
  Info,
  ChevronLeft,
  MoreHorizontal,
  UserPlus,
  Calendar,
  Download,
  Wallet
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useAuth, authService } from "../lib/auth"
import { useLiveMarketData } from "@/hooks/use-live-market-data"
import { RealTimeMarketBanner } from "./real-time-market-banner"
import { LiveFootballScores } from "./live-football-scores"
import { ErrorBoundary } from "./error-boundary"
import { TradingIcon, TradingIconService } from "@/lib/trading-icons"

interface UserPosition {
  id: string
  symbol: string
  name: string
  quantity: number
  buyPrice: number
  currentPrice: number
  value: number
  pnl: number
  pnlPercent: number
  type: 'buy' | 'sell'
  logo?: string
  industry?: string
}

interface AssetCard {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  logo?: string
  sentiment?: number // 0-100
  socialVolume?: number
  industry?: string
  description?: string
}

interface SocialPost {
  id: string
  user: string
  avatar: string
  action: string
  asset: string
  amount: number
  timestamp: Date
  likes: number
  comments: number
}

const UserTradingDashboardComponent = () => {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState<'watchlist' | 'portfolio' | 'discover' | 'social'>('watchlist')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [tradeAmount, setTradeAmount] = useState([1000])
  const [portfolio, setPortfolio] = useState({
    totalValue: 25847.32,
    availableCash: 2847.32,
    totalPnL: 1847.32,
    totalPnLPercent: 7.68,
    positions: [
      {
        id: '1',
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 0.5,
        avgBuyPrice: 42000,
        currentPrice: 43250,
        value: 21625,
        pnl: 625,
        pnlPercent: 2.98,
        type: 'buy' as const,
        openDate: new Date('2024-01-15'),
        logo: 'BTC' // Use symbol for TradingIcon
      },
      {
        id: '2',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 12,
        avgBuyPrice: 185,
        currentPrice: 189.50,
        value: 2274,
        pnl: 54,
        pnlPercent: 2.43,
        type: 'buy' as const,
        openDate: new Date('2024-02-01'),
        logo: 'AAPL' // Use symbol for TradingIcon
      },
      {
        id: '3',
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        quantity: 8,
        avgBuyPrice: 220,
        currentPrice: 208.75,
        value: 1670,
        pnl: -90,
        pnlPercent: -5.11,
        type: 'buy' as const,
        openDate: new Date('2024-01-20'),
        logo: 'TSLA' // Use symbol for TradingIcon
      }
    ]
  })

  const { data: marketData, isLoading, hasError, apiStatus } = useLiveMarketData({
    updateInterval: 120000,
    autoStart: true
  })

  console.log('📊 Market Data Status:', {
    dataLength: marketData?.length || 0,
    isLoading,
    hasError,
    apiStatus,
    firstItem: marketData?.[0]
  })

  // eToro-style filters with Sports Bets
  const filters = ['All', 'Market Open', 'People', 'Indices', 'Stocks', 'Crypto', 'Commodities', 'Currencies', 'Smart Portfolios', 'Sports Bets']

  // Sports Bets data for Sports Bets tab
  const sportsBetsData = [
    {
      symbol: 'BET365',
      name: 'Bet365 Group Limited',
      price: 285.42,
      buyPrice: 285.50,
      sellPrice: 285.34,
      change: 3.25,
      changePercent: 1.15,
      week52Low: 220.50,
      week52High: 310.80,
      sentiment: 88,
      sentimentLabel: 'Buying',
      logo: 'BET365', // Use symbol for TradingIcon
      bgColor: 'bg-green-600',
      chartData: [65, 68, 72, 75, 78, 82, 85, 88],
      isNegative: false
    },
    {
      symbol: '22BETS',
      name: '22Bets Sports Betting',
      price: 156.78,
      buyPrice: 156.85,
      sellPrice: 156.71,
      change: -2.15,
      changePercent: -1.35,
      week52Low: 125.40,
      week52High: 180.90,
      sentiment: 75,
      sentimentLabel: 'Buying',
      logo: '22BETS', // Use symbol for TradingIcon
      bgColor: 'bg-blue-600',
      chartData: [80, 75, 70, 65, 60, 58, 55, 52],
      isNegative: true
    },
    {
      symbol: 'SHARP',
      name: 'Sharp Betting Exchange',
      price: 198.65,
      buyPrice: 198.72,
      sellPrice: 198.58,
      change: 4.80,
      changePercent: 2.48,
      week52Low: 165.20,
      week52High: 225.40,
      sentiment: 92,
      sentimentLabel: 'Buying',
      logo: 'SHARP', // Use symbol for TradingIcon
      bgColor: 'bg-yellow-600',
      chartData: [55, 60, 65, 70, 75, 80, 85, 92],
      isNegative: false
    },
    {
      symbol: 'B33',
      name: 'B33 Sports Platform',
      price: 134.21,
      buyPrice: 134.28,
      sellPrice: 134.14,
      change: 1.95,
      changePercent: 1.47,
      week52Low: 98.50,
      week52High: 155.70,
      sentiment: 82,
      sentimentLabel: 'Buying',
      logo: 'B33', // Use symbol for TradingIcon
      bgColor: 'bg-purple-600',
      chartData: [45, 50, 55, 60, 65, 70, 75, 82],
      isNegative: false
    },
    {
      symbol: 'ASIANMKT',
      name: 'Asian Market Betting',
      price: 267.89,
      buyPrice: 267.95,
      sellPrice: 267.83,
      change: -1.25,
      changePercent: -0.46,
      week52Low: 235.60,
      week52High: 295.40,
      sentiment: 68,
      sentimentLabel: 'Buying',
      logo: 'ASIANMKT', // Use symbol for TradingIcon
      bgColor: 'bg-red-600',
      chartData: [85, 80, 75, 72, 70, 68, 66, 68],
      isNegative: true
    },
    {
      symbol: 'BOOKILING',
      name: 'Bookiling Sports Book',
      price: 89.45,
      buyPrice: 89.50,
      sellPrice: 89.40,
      change: 2.30,
      changePercent: 2.64,
      week52Low: 65.80,
      week52High: 105.20,
      sentiment: 85,
      sentimentLabel: 'Buying',
      logo: 'BOOKILING', // Use symbol for TradingIcon
      bgColor: 'bg-indigo-600',
      chartData: [40, 45, 50, 55, 60, 70, 80, 85],
      isNegative: false
    },
    {
      symbol: 'STAKE',
      name: 'Stake Sports Betting',
      price: 324.56,
      buyPrice: 324.62,
      sellPrice: 324.50,
      change: 5.45,
      changePercent: 1.71,
      week52Low: 280.40,
      week52High: 365.80,
      sentiment: 94,
      sentimentLabel: 'Buying',
      logo: 'STAKE', // Use symbol for TradingIcon
      bgColor: 'bg-green-600',
      chartData: [70, 75, 80, 82, 85, 88, 92, 94],
      isNegative: false
    },
    {
      symbol: 'PINNACLE',
      name: 'Pinnacle Sports',
      price: 412.78,
      buyPrice: 412.85,
      sellPrice: 412.71,
      change: 7.80,
      changePercent: 1.93,
      week52Low: 350.90,
      week52High: 445.60,
      sentiment: 96,
      sentimentLabel: 'Buying',
      logo: 'PINNACLE', // Use symbol for TradingIcon
      bgColor: 'bg-slate-600',
      chartData: [75, 80, 85, 88, 90, 92, 94, 96],
      isNegative: false
    }
  ]

  // Smart Portfolios data for Smart Portfolios tab
  const smartPortfoliosData = [
    {
      id: '21',
      symbol: '21Shares-Flows',
      name: '21Shares-Flows',
      subtitle: 'Crypto Monthly Market Flows',
      return1M: -7.13,
      riskScore: 6,
      investors: 125,
      change: -3.85,
      isPositive: false,
      logo: '21'
    },
    {
      id: 'WT',
      symbol: 'WisdomTree-Comm',
      name: 'WisdomTree-Comm',
      subtitle: 'Commodity Strategy Portfolio',
      return1M: 7.08,
      riskScore: 6,
      investors: 209,
      change: 8.85,
      isPositive: true,
      logo: 'WT'
    }
  ]

  // Commodities data for Commodities tab
  const commoditiesData = [
    {
      symbol: 'GOLD',
      name: 'Gold (Non Expiry)',
      price: 3379.31,
      buyPrice: 3379.74,
      sellPrice: 3378.89,
      change: 10.92,
      changePercent: 0.32,
      week52Low: 2293.47,
      week52High: 3499.49,
      sentiment: 92,
      sentimentLabel: 'Buying',
      logo: 'GOLD', // Use symbol for TradingIcon
      bgColor: 'bg-yellow-600',
      chartData: [65, 68, 72, 75, 78, 82, 85, 88],
      isNegative: false
    },
    {
      symbol: 'OIL',
      name: 'Oil (Non Expiry)',
      price: 68.45,
      buyPrice: 68.48,
      sellPrice: 68.42,
      change: -5.57,
      changePercent: -7.53,
      week52Low: 54.83,
      week52High: 84.04,
      sentiment: 95,
      sentimentLabel: 'Buying',
      logo: 'OIL', // Use symbol for TradingIcon
      bgColor: 'bg-slate-800',
      chartData: [85, 80, 75, 70, 65, 60, 55, 50],
      isNegative: true
    },
    {
      symbol: 'NATGAS',
      name: 'Natural Gas (Non Expiry)',
      price: 3.806,
      buyPrice: 3.812,
      sellPrice: 3.801,
      change: -0.181,
      changePercent: -4.55,
      week52Low: 1.93,
      week52High: 4.82,
      sentiment: 55,
      sentimentLabel: 'Buying',
      logo: 'NATGAS', // Use symbol for TradingIcon
      bgColor: 'bg-blue-600',
      chartData: [75, 70, 65, 60, 55, 50, 45, 40],
      isNegative: true
    }
  ]

  // Currencies data for Currencies tab
  const currenciesData = [
    {
      symbol: 'EURGBP',
      name: 'Euro / British Pound',
      price: 0.85576,
      buyPrice: 0.85583,
      sellPrice: 0.85569,
      change: -0.00095,
      changePercent: -0.11,
      week52Low: 0.82,
      week52High: 0.87,
      sentiment: 58,
      sentimentLabel: 'Shorting',
      logo: 'EURGBP', // Use symbol for TradingIcon
      bgColor: 'bg-blue-600',
      chartData: [45, 48, 52, 55, 53, 51, 49, 47],
      isNegative: true
    },
    {
      symbol: 'GBPUSD',
      name: 'British Pound / US Dollar',
      price: 1.35254,
      buyPrice: 1.35265,
      sellPrice: 1.35242,
      change: 0.00816,
      changePercent: 0.61,
      week52Low: 1.21,
      week52High: 1.36,
      sentiment: 51,
      sentimentLabel: 'Buying',
      logo: 'GBPUSD', // Use symbol for TradingIcon
      bgColor: 'bg-blue-600',
      chartData: [40, 42, 45, 48, 50, 52, 54, 56],
      isNegative: false
    },
    {
      symbol: 'EURUSD',
      name: 'Euro / US Dollar',
      price: 1.15748,
      buyPrice: 1.15753,
      sellPrice: 1.15742,
      change: 0.00570,
      changePercent: 0.49,
      week52Low: 1.02,
      week52High: 1.16,
      sentiment: 56,
      sentimentLabel: 'Shorting',
      logo: 'EURUSD', // Use symbol for TradingIcon
      bgColor: 'bg-blue-600',
      chartData: [35, 38, 42, 45, 47, 49, 51, 53],
      isNegative: false
    },
    {
      symbol: 'USDJPY',
      name: 'US Dollar / Japanese Yen',
      price: 146.096,
      buyPrice: 146.102,
      sellPrice: 146.089,
      change: -0.035,
      changePercent: -0.02,
      week52Low: 139.57,
      week52High: 161.95,
      sentiment: 52,
      sentimentLabel: 'Buying',
      logo: 'USDJPY', // Use symbol for TradingIcon
      bgColor: 'bg-red-600',
      chartData: [60, 58, 55, 52, 50, 48, 46, 44],
      isNegative: true
    }
  ]

  // Crypto data for Crypto tab
  const cryptoData = [
    {
      symbol: 'DOGE',
      name: 'Dogecoin',
      price: 0.15253,
      buyPrice: 0.15566,
      sellPrice: 0.15240,
      change: 0.00678,
      changePercent: 4.65,
      week52Low: 0.08,
      week52High: 0.68,
      sentiment: 100,
      sentimentLabel: 'Buying',
      logo: 'DOGE', // Use symbol for TradingIcon
      bgColor: 'bg-yellow-600',
      chartData: [20, 25, 30, 35, 40, 45, 50, 55],
      isNegative: false
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 100755.86,
      buyPrice: 102826.79,
      sellPrice: 100685.93,
      change: 1877.44,
      changePercent: 1.86,
      week52Low: 48569.59,
      week52High: 110872.11,
      sentiment: 100,
      sentimentLabel: 'Buying',
      logo: 'BTC', // Use symbol for TradingIcon
      bgColor: 'bg-orange-500',
      chartData: [30, 38, 45, 52, 58, 64, 70, 76],
      isNegative: false
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 2234.67,
      buyPrice: 2237.85,
      sellPrice: 2231.49,
      change: -15.33,
      changePercent: -0.68,
      week52Low: 1543.80,
      week52High: 4091.77,
      sentiment: 85,
      sentimentLabel: 'Buying',
      logo: 'ETH', // Use symbol for TradingIcon
      bgColor: 'bg-indigo-600',
      chartData: [45, 48, 46, 44, 42, 40, 38, 36],
      isNegative: true
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 98.42,
      buyPrice: 98.75,
      sellPrice: 98.09,
      change: 3.67,
      changePercent: 3.88,
      week52Low: 8.18,
      week52High: 259.96,
      sentiment: 92,
      sentimentLabel: 'Buying',
      logo: 'SOL', // Use symbol for TradingIcon
      bgColor: 'bg-purple-600',
      chartData: [25, 28, 32, 35, 38, 42, 45, 48],
      isNegative: false
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      price: 0.3847,
      buyPrice: 0.3852,
      sellPrice: 0.3842,
      change: 0.0123,
      changePercent: 3.31,
      week52Low: 0.2367,
      week52High: 1.3315,
      sentiment: 78,
      sentimentLabel: 'Buying',
      logo: 'ADA', // Use symbol for TradingIcon
      bgColor: 'bg-blue-600',
      chartData: [20, 22, 25, 28, 30, 32, 35, 38],
      isNegative: false
    }
  ]

  // Watchlist assets
  const watchlistAssets = [
    {
      symbol: 'TSLA',
      name: 'Tesla Motors',
      price: 248.42,
      buyPrice: 248.50,
      sellPrice: 248.34,
      change: 4.12,
      changePercent: 1.68,
      volume: 45200000,
      logo: 'TSLA', // Use symbol for TradingIcon
      sentiment: 87,
      sentimentLabel: 'Buying',
      week52Low: 180.50,
      week52High: 310.20,
      bgColor: 'bg-red-600',
      chartData: [40, 45, 50, 55, 60, 65, 70, 75],
      isNegative: false,
      industry: 'Electric Vehicles'
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 67250.00,
      buyPrice: 67320.50,
      sellPrice: 67179.50,
      change: -1250.50,
      changePercent: -1.83,
      volume: 28500000,
      logo: 'BTC', // Use symbol for TradingIcon
      sentiment: 72,
      sentimentLabel: 'Buying',
      week52Low: 48569.59,
      week52High: 110872.11,
      bgColor: 'bg-orange-500',
      chartData: [80, 75, 70, 65, 60, 55, 50, 45],
      isNegative: true,
      industry: 'Cryptocurrency'
    },
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 189.25,
      buyPrice: 189.31,
      sellPrice: 189.19,
      change: 2.47,
      changePercent: 1.32,
      volume: 52100000,
      logo: 'AAPL', // Use symbol for TradingIcon
      sentiment: 89,
      sentimentLabel: 'Buying',
      week52Low: 164.08,
      week52High: 199.62,
      bgColor: 'bg-gray-800',
      chartData: [35, 38, 42, 45, 48, 52, 55, 58],
      isNegative: false,
      industry: 'Technology'
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 876.34,
      buyPrice: 877.12,
      sellPrice: 875.56,
      change: 18.92,
      changePercent: 2.21,
      volume: 41800000,
      logo: 'NVDA', // Use symbol for TradingIcon
      sentiment: 94,
      sentimentLabel: 'Buying',
      week52Low: 394.50,
      week52High: 974.38,
      bgColor: 'bg-green-600',
      chartData: [25, 30, 35, 42, 48, 55, 62, 68],
      isNegative: false,
      industry: 'Semiconductors'
    }
  ]

  // Smart Portfolios Table Component
  const SmartPortfoliosTable = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Smart Portfolios */}
      <div className="bg-[#1A1D29] rounded-lg">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Smart Portfolios</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-slate-400 font-medium">Smart Portfolios</th>
                <th className="text-left p-4 text-slate-400 font-medium">Return 1M</th>
                <th className="text-left p-4 text-slate-400 font-medium">Risk score</th>
                <th className="text-left p-4 text-slate-400 font-medium">Investors</th>
                <th className="text-left p-4 text-slate-400 font-medium">Change</th>
                <th className="text-right p-4 text-slate-400 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {smartPortfoliosData.map((portfolio) => (
                <tr key={portfolio.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <TradingIcon symbol={portfolio.symbol} size={32} className="drop-shadow-lg" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{portfolio.name}</div>
                        <div className="text-slate-400 text-sm">{portfolio.subtitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${portfolio.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {portfolio.return1M > 0 ? '+' : ''}{portfolio.return1M.toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500 bg-yellow-500/10">
                      {portfolio.riskScore}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="text-white">{portfolio.investors}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {portfolio.isPositive ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`text-sm ${portfolio.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {portfolio.change > 0 ? '+' : ''}{portfolio.change.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white px-6"
                      onClick={() => openTradeDialog(portfolio)}
                    >
                      Invest
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Discover Smart Portfolios */}
        <div className="p-4 border-t border-slate-700">
          <Button variant="ghost" className="text-slate-400 hover:text-white w-full flex items-center gap-2">
            <Search className="h-4 w-4" />
            Discover Smart Portfolios
          </Button>
        </div>
      </div>
    </div>
  )

  // Main table component with Agora instead of Short
  const TableComponent = ({ data, title }: { data: any[], title: string }) => {
    console.log('📋 TableComponent rendering with:', { title, dataLength: data.length, firstItem: data[0] })
    return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-[#1A1D29] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-slate-400 font-medium">Markets</th>
                <th className="text-left p-4 text-slate-400 font-medium">Change 1D</th>
                <th className="text-left p-4 text-slate-400 font-medium">Agora</th>
                <th className="text-left p-4 text-slate-400 font-medium">Buy</th>
                <th className="text-left p-4 text-slate-400 font-medium">52W Range</th>
                <th className="text-left p-4 text-slate-400 font-medium">Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <TradingIcon symbol={item.symbol} size={32} className="drop-shadow-lg" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{item.symbol}</div>
                        <div className="text-slate-400 text-sm">{item.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className={`font-medium ${item.isNegative ? 'text-red-500' : 'text-green-500'}`}>
                          {item.changePercent ? (item.changePercent > 0 ? '+' : '') + item.changePercent.toFixed(2) + '%' : '0.00%'}
                        </span>
                        <span className={`text-sm ${item.isNegative ? 'text-red-500' : 'text-green-500'}`}>
                          {item.change ? (item.change > 0 ? '+' : '') + item.change.toFixed(item.price < 1 ? 3 : 2) : '0.00'}
                        </span>
                      </div>
                      <div className="w-16 h-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={item.chartData?.map((value: number, idx: number) => ({ value })) || []}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={item.isNegative ? '#ef4444' : '#22c55e'}
                              strokeWidth={1.5}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 px-3 min-w-[32px]"
                        onClick={() => openTradeDialog(item)}
                      >
                        A
                      </Button>
                      <span className="text-white font-medium">
                        {item.sellPrice ? item.sellPrice.toFixed(item.sellPrice < 1 ? 5 : 2) : item.price ? item.price.toFixed(item.price < 1 ? 5 : 2) : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white px-3 min-w-[32px]"
                        onClick={() => openTradeDialog(item)}
                      >
                        B
                      </Button>
                      <span className="text-white font-medium">
                        {item.buyPrice ? item.buyPrice.toFixed(item.buyPrice < 1 ? 5 : 2) : item.price ? item.price.toFixed(item.price < 1 ? 5 : 2) : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="w-24 h-1 bg-slate-600 rounded-full relative">
                        <div
                          className="h-full bg-blue-500 rounded-full absolute"
                          style={{
                            width: `${((item.price - item.week52Low) / (item.week52High - item.week52Low)) * 100}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{item.week52Low?.toFixed(item.week52Low < 1 ? 2 : 0)}</span>
                        <span>{item.week52High?.toFixed(item.week52High < 1 ? 2 : 0)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <div className="w-20 h-2 bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.sentimentLabel === 'Shorting' ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${item.sentiment}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{item.sentiment}% {item.sentimentLabel}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Markets Button */}
        <div className="p-4 border-t border-slate-700">
          <Button variant="ghost" className="text-slate-400 hover:text-white w-full flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Markets
          </Button>
        </div>
      </div>
    </div>
    )
  }

  // Sidebar Component
  const Sidebar = () => (
    <div className="flex h-full max-h-screen flex-col gap-2 bg-[#1A1D29] border-r border-slate-800">
      <div className="flex h-14 items-center border-b border-slate-800 px-4 lg:h-[60px] lg:px-6">
        <div className="flex items-center gap-2 font-semibold text-white">
          <BarChart3 className="h-6 w-6" />
          <span className="text-lg">TradingPro</span>
        </div>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
          <Button
            variant={currentPage === 'watchlist' ? 'secondary' : 'ghost'}
            className="justify-start text-white hover:text-white hover:bg-slate-800 h-11"
            onClick={() => setCurrentPage('watchlist')}
          >
            <Eye className="mr-3 h-5 w-5" />
            Watchlist
          </Button>
          <Button
            variant={currentPage === 'portfolio' ? 'secondary' : 'ghost'}
            className="justify-start text-white hover:text-white hover:bg-slate-800 h-11"
            onClick={() => setCurrentPage('portfolio')}
          >
            <Briefcase className="mr-3 h-5 w-5" />
            Portfolio
          </Button>
        </nav>
      </div>
    </div>
  )

  // Header Component
  const Header = () => (
    <header className="flex h-16 items-center gap-4 border-b border-slate-800 bg-[#1A1D29] px-4 lg:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-white font-bold text-xl">TradingPro</div>
      </div>

      <div className="flex-1 max-w-md ml-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border-slate-600 text-white placeholder-slate-400 pl-10 pr-4 h-10 rounded-lg"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
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
            <DropdownMenuItem className="text-white hover:bg-slate-700" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )

  // Render page content based on current page and filter
  const renderPageContent = () => {
    console.log('🖥️ Rendering page content:', { currentPage, selectedFilter })
    switch (currentPage) {
      case 'watchlist':
        if (selectedFilter === 'Smart Portfolios') return <SmartPortfoliosTable />
        if (selectedFilter === 'Sports Bets') return <TableComponent data={sportsBetsData} title="My Watchlist" />
        if (selectedFilter === 'Crypto') return <TableComponent data={cryptoData} title="My Watchlist" />
        if (selectedFilter === 'Commodities') return <TableComponent data={commoditiesData} title="My Watchlist" />
        if (selectedFilter === 'Currencies') return <TableComponent data={currenciesData} title="My Watchlist" />
        return <TableComponent data={watchlistAssets} title="My Watchlist" />
      case 'portfolio':
        return <div className="text-white">Portfolio view coming soon...</div>
      default:
        if (selectedFilter === 'Smart Portfolios') return <SmartPortfoliosTable />
        if (selectedFilter === 'Sports Bets') return <TableComponent data={sportsBetsData} title="My Watchlist" />
        if (selectedFilter === 'Crypto') return <TableComponent data={cryptoData} title="My Watchlist" />
        if (selectedFilter === 'Commodities') return <TableComponent data={commoditiesData} title="My Watchlist" />
        if (selectedFilter === 'Currencies') return <TableComponent data={currenciesData} title="My Watchlist" />
        return <TableComponent data={watchlistAssets} title="My Watchlist" />
    }
  }

  // Event handlers
  const handleLogout = useCallback(async () => {
    await authService.logout()
  }, [])

  const openTradeDialog = useCallback((asset: any) => {
    setSelectedAsset(asset)
    setIsTradeDialogOpen(true)
  }, [])

  // Enhanced Trade Dialog
  const EnhancedTradeDialog = () => (
    <Dialog open={isTradeDialogOpen} onOpenChange={setIsTradeDialogOpen}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {selectedAsset?.symbol} Trade
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {selectedAsset?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              ${selectedAsset?.price?.toFixed(2)}
            </div>
            <div className={`text-sm ${selectedAsset?.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {selectedAsset?.changePercent >= 0 ? '+' : ''}{selectedAsset?.changePercent?.toFixed(2)}%
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="trade-amount" className="text-white">Amount to invest</Label>
              <Input
                id="trade-amount"
                type="number"
                defaultValue="1000"
                className="bg-slate-800 border-slate-600 text-white mt-2"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsTradeDialogOpen(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">
            Cancel
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsTradeDialogOpen(false)}>
            Buy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  console.log('🏪 UserTradingDashboard rendering...')
  console.log('📊 Sports Bets Data:', sportsBetsData.length, 'items')
  console.log('💰 First Sport Bet:', sportsBetsData[0])

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr] bg-[#0D1117]">
      <div className="hidden border-r border-slate-800 md:block">
        <Sidebar />
      </div>
      <div className="flex flex-col">
        <Header />
        <ErrorBoundary>
          <RealTimeMarketBanner />
        </ErrorBoundary>
        <ErrorBoundary>
          <LiveFootballScores />
        </ErrorBoundary>

        {/* Filter tabs */}
        <div className="bg-[#1A1D29] border-b border-slate-800 px-6 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className={`whitespace-nowrap ${
                  selectedFilter === filter
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        <main className="flex flex-1 flex-col gap-6 p-6 bg-[#0D1117] overflow-auto">
          <ErrorBoundary>
            {renderPageContent()}
          </ErrorBoundary>
        </main>
      </div>

      <EnhancedTradeDialog />
    </div>
  )
}

export const UserTradingDashboard = memo(UserTradingDashboardComponent)
