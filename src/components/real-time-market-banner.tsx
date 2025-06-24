"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { useLiveMarketData } from "@/hooks/use-live-market-data"
import type { LiveMarketData } from "@/lib/live-market-api"

// Use the LiveMarketData interface directly
type MarketItem = LiveMarketData

// Mini sparkline chart component with better error handling
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  try {
    if (!data || data.length === 0) {
      // Return a flat line instead of null
      return (
        <svg width="40" height="15" className="inline-block ml-2">
          <line x1="0" y1="7.5" x2="40" y2="7.5" stroke={color} strokeWidth="1" opacity="0.5" />
        </svg>
      )
    }

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 40
      const y = 15 - ((value - min) / range) * 10
      return `${x},${y}`
    }).join(' ')

    return (
      <svg width="40" height="15" className="inline-block ml-2">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          className="opacity-80"
        />
      </svg>
    )
  } catch (error) {
    console.warn('Error rendering sparkline:', error)
    return (
      <div className="inline-block ml-2 w-10 h-4 bg-slate-700 rounded opacity-50"></div>
    )
  }
}

export function RealTimeMarketBanner() {
  console.log('💹 RealTimeMarketBanner component rendering...')
  const [stylesInjected, setStylesInjected] = useState(false)

  // Use the custom hook for market data
  const {
    data: marketData,
    isLoading,
    hasError,
    apiStatus,
    lastUpdated,
    retryCount,
    refresh,
    liveDataCount,
    mockDataCount,
    isStale
  } = useLiveMarketData({
    updateInterval: 120000, // 2 minutes
    autoStart: true
  })

  console.log('💹 RealTimeMarketBanner data status:', {
    dataLength: marketData?.length || 0,
    isLoading,
    hasError,
    apiStatus,
    liveDataCount,
    mockDataCount
  })

  // Inject marquee CSS styles safely
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    try {
      // Check if styles are already injected
      if (document.getElementById('market-banner-styles')) {
        setStylesInjected(true)
        return
      }

      const style = document.createElement('style')
      style.id = 'market-banner-styles'
      style.textContent = `
        @keyframes market-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .market-banner-scroll {
          animation: market-marquee 45s linear infinite;
          will-change: transform;
          visibility: visible !important;
          opacity: 1 !important;
        }

        .market-banner-scroll:hover {
          animation-play-state: paused;
        }

        .market-banner-loading {
          animation: market-marquee 45s linear infinite;
          opacity: 0.7;
        }

        /* Ensure content is always visible */
        .market-banner-scroll > * {
          visibility: visible !important;
          opacity: 1 !important;
        }
      `

      document.head.appendChild(style)
      setStylesInjected(true)
      console.log('✅ Market banner styles injected successfully')
    } catch (error) {
      console.warn('Failed to inject market banner styles:', error)
      setStylesInjected(false)
    }

    // Cleanup function
    return () => {
      try {
        const existingStyle = document.getElementById('market-banner-styles')
        if (existingStyle && existingStyle.parentNode) {
          existingStyle.parentNode.removeChild(existingStyle)
        }
      } catch (error) {
        console.warn('Error removing market banner styles:', error)
      }
    }
  }, [])

  // Get status icon based on API health and loading state
  const getStatusIcon = () => {
    if (isLoading) {
      return <RefreshCw className="h-3 w-3 animate-spin text-blue-400" />
    }

    switch (apiStatus) {
      case 'healthy':
        return <Wifi className="h-3 w-3 text-green-400" />
      case 'degraded':
        return <Wifi className="h-3 w-3 text-yellow-400" />
      case 'down':
        return <WifiOff className="h-3 w-3 text-red-400" />
      default:
        return <Wifi className="h-3 w-3 text-gray-400" />
    }
  }

  // Format price with proper decimals
  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'EURUSD') {
      return price.toFixed(5)
    }
    if (['TRX', 'ADA', 'MATIC', 'DOGE'].includes(symbol)) {
      return price.toFixed(4)
    }
    return price.toLocaleString(undefined, {
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2
    })
  }

  // ALWAYS show market data, even if loading or error
  const fallbackData = [
    { symbol: 'DJ30', name: 'Dow Jones 30', price: 42429.12, change24h: 234.56, changePercent24h: 0.56, volume24h: 0, marketCap: 0, sparklineData: [100, 101, 100, 102, 101, 103, 102, 104, 103, 105], lastUpdated: new Date(), source: 'mock' as const },
    { symbol: 'BTC', name: 'Bitcoin', price: 67250, change24h: -1250.50, changePercent24h: -1.83, volume24h: 28500000000, marketCap: 1320000000000, sparklineData: [100, 102, 104, 103, 105, 107, 106, 108, 107, 109], lastUpdated: new Date(), source: 'mock' as const },
    { symbol: 'ETH', name: 'Ethereum', price: 2239.45, change24h: -27.55, changePercent24h: -1.23, volume24h: 15400000000, marketCap: 269000000000, sparklineData: [100, 99, 98, 97, 99, 98, 97, 96, 98, 97], lastUpdated: new Date(), source: 'mock' as const },
    { symbol: 'SOL', name: 'Solana', price: 98.45, change24h: 3.52, changePercent24h: 3.7, volume24h: 2100000000, marketCap: 44000000000, sparklineData: [100, 102, 104, 103, 105, 107, 106, 108, 107, 109], lastUpdated: new Date(), source: 'mock' as const },
    { symbol: 'EURUSD', name: 'Euro/US Dollar', price: 1.08234, change24h: 0.00123, changePercent24h: 0.11, volume24h: 0, marketCap: 0, sparklineData: [100, 100.1, 100.05, 100.15, 100.08, 100.12, 100.07, 100.18, 100.11, 100.14], lastUpdated: new Date(), source: 'mock' as const },
    { symbol: 'GOLD', name: 'Gold', price: 2034.50, change24h: 12.30, changePercent24h: 0.61, volume24h: 0, marketCap: 0, sparklineData: [100, 101, 100.5, 101.5, 100.8, 101.2, 100.7, 101.8, 101.1, 101.4], lastUpdated: new Date(), source: 'mock' as const }
  ]

  const displayData = marketData && marketData.length > 0 ? marketData : fallbackData

  console.log('💹 RealTimeMarketBanner displayData:', {
    usingFallback: !marketData || marketData.length === 0,
    dataLength: displayData.length,
    firstItem: displayData[0]
  })

  return (
    <div className="bg-slate-900 border-b border-slate-700 py-4 overflow-hidden relative">
      <div
        className={`flex whitespace-nowrap ${
          stylesInjected
            ? (isLoading ? 'market-banner-loading' : 'market-banner-scroll')
            : ''
        }`}
        style={{
          width: 'max-content',
          // Fallback animation if CSS injection fails
          ...(!stylesInjected && {
            animation: 'marquee 45s linear infinite'
          })
        }}
      >
        {/* Duplicate items for seamless loop - ENSURE VISIBILITY */}
        {[...displayData, ...displayData].map((item, index) => (
          <div key={`${item.symbol}-${index}`} className="flex-shrink-0 min-w-[200px] mx-8 opacity-100 visible">
            <div className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wide flex items-center space-x-1">
              <span>{item.symbol}</span>
              {item.source === 'coingecko' && (
                <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" title="Live data from CoinGecko"></div>
              )}
              {item.source === 'mock' && (
                <div className="h-1.5 w-1.5 bg-yellow-400 rounded-full" title="Simulated data"></div>
              )}
            </div>
            <div className="text-white text-xl font-bold mb-1">
              ${formatPrice(item.price, item.symbol)}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium flex items-center gap-1 ${
                item.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {item.changePercent24h >= 0 ?
                  <TrendingUp className="h-3 w-3" /> :
                  <TrendingDown className="h-3 w-3" />
                }
                {item.changePercent24h >= 0 ? '+' : ''}{item.changePercent24h.toFixed(2)}%
              </span>
              <Sparkline
                data={item.sparklineData || []}
                color={item.changePercent24h >= 0 ? '#4ade80' : '#f87171'}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Status and last updated info - ENHANCED */}
      <div className="absolute top-2 right-4 text-xs text-slate-500 z-10 flex items-center space-x-2">
        {getStatusIcon()}
        <span>
          {isLoading ? 'Updating...' :
           hasError ? 'Limited' :
           apiStatus === 'healthy' ? 'Live' :
           apiStatus === 'degraded' ? 'Limited' : 'Offline'
          }
        </span>
        {lastUpdated && !isLoading && (
          <>
            <span>•</span>
            <span>{lastUpdated.toLocaleTimeString()}</span>
            {isStale && <span className="text-red-400 ml-1">⚠</span>}
          </>
        )}
        {retryCount > 0 && (
          <span className="text-yellow-400">({retryCount})</span>
        )}
      </div>

      {/* Data source indicator - ENHANCED */}
      <div className="absolute bottom-2 right-4 text-xs text-slate-600 z-10">
        <div className="flex items-center space-x-2">
          {liveDataCount > 0 && (
            <div className="flex items-center space-x-1" title={`${liveDataCount} live data sources`}>
              <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">{liveDataCount} live</span>
            </div>
          )}
          {mockDataCount > 0 && (
            <div className="flex items-center space-x-1" title={`${mockDataCount} mock data sources`}>
              <div className="h-1.5 w-1.5 bg-yellow-400 rounded-full"></div>
              <span className="text-yellow-400">{mockDataCount} demo</span>
            </div>
          )}
          {hasError && (
            <div className="flex items-center space-x-1" title="Using fallback data">
              <div className="h-1.5 w-1.5 bg-orange-400 rounded-full"></div>
              <span className="text-orange-400">fallback</span>
            </div>
          )}

          {/* Manual refresh button */}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="ml-2 text-slate-500 hover:text-slate-300 disabled:opacity-50"
            title="Refresh market data"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Fallback CSS animation if injection fails */}
      {!stylesInjected && (
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `
        }} />
      )}

      {/* Loading overlay */}
      {isLoading && marketData.length === 0 && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-20">
          <div className="flex items-center space-x-3 text-slate-300">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-400" />
            <span>Loading market data...</span>
          </div>
        </div>
      )}

      {/* Error overlay (only if no data at all) */}
      {hasError && displayData.length === 0 && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-20">
          <div className="flex items-center space-x-3 text-slate-300">
            <WifiOff className="h-5 w-5 text-red-400" />
            <span>Market data unavailable</span>
            <button
              onClick={refresh}
              className="px-2 py-1 bg-slate-700 rounded text-xs hover:bg-slate-600"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
