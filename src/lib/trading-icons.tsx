import type React from 'react'

// Enhanced Trading Icons Service
// Professional SVG icons for trading dashboard

export interface TradingIconProps {
  symbol: string
  size?: number
  className?: string
}

// Crypto Currency SVG Icons
const CryptoIcons = {
  BTC: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="btcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7931a" />
          <stop offset="100%" stopColor="#ff8c00" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#btcGradient)" />
      <path
        d="M15.5 10.5C15.5 9.12 14.38 8 13 8H9v5h4C14.38 13 15.5 11.88 15.5 10.5zM13.5 15H9v5h4.5C14.88 20 16 18.88 16 17.5S14.88 15 13.5 15zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM14 17.5C14 18.33 13.33 19 12.5 19H10v1.5H9V19H7.5v-1H9v-5H7.5v-1H9V6.5h1V8h1.5C12.88 8 14 9.12 14 10.5c0 .8-.4 1.51-1 1.95.6.44 1 1.15 1 1.95v3.1z"
        fill="white"
      />
    </svg>
  ),

  ETH: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="ethGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#627eea" />
          <stop offset="100%" stopColor="#3c5aa6" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#ethGradient)" />
      <polygon
        points="12,3 12,9.5 18,12 12,3"
        fill="white"
        opacity="0.6"
      />
      <polygon
        points="12,3 6,12 12,9.5 12,3"
        fill="white"
      />
      <polygon
        points="12,13.2 12,21 18,13.2 12,13.2"
        fill="white"
        opacity="0.6"
      />
      <polygon
        points="12,21 12,13.2 6,13.2 12,21"
        fill="white"
      />
      <polygon
        points="12,12.3 18,12 12,9.5 12,12.3"
        fill="white"
        opacity="0.2"
      />
      <polygon
        points="6,12 12,12.3 12,9.5 6,12"
        fill="white"
        opacity="0.6"
      />
    </svg>
  ),

  SOL: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="solGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ffa3" />
          <stop offset="100%" stopColor="#dc1fff" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#solGradient)" />
      <path
        d="M7.5 8.5h9c.28 0 .5.22.5.5s-.22.5-.5.5h-9c-.28 0-.5-.22-.5-.5s.22-.5.5-.5zm0 3h9c.28 0 .5.22.5.5s-.22.5-.5.5h-9c-.28 0-.5-.22-.5-.5s.22-.5.5-.5zm0 3h9c.28 0 .5.22.5.5s-.22.5-.5.5h-9c-.28 0-.5-.22-.5-.5s.22-.5.5-.5z"
        fill="white"
      />
    </svg>
  ),

  DOGE: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="dogeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c2a633" />
          <stop offset="100%" stopColor="#d9b441" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#dogeGradient)" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        Ð
      </text>
    </svg>
  ),

  ADA: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="adaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d1e30" />
          <stop offset="100%" stopColor="#2d5aa6" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#adaGradient)" />
      <circle cx="12" cy="8" r="2" fill="white" />
      <circle cx="8" cy="14" r="1.5" fill="white" />
      <circle cx="16" cy="14" r="1.5" fill="white" />
      <circle cx="12" cy="18" r="1" fill="white" />
    </svg>
  )
}

// Stock Company SVG Icons
const StockIcons = {
  AAPL: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="appleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a6b1b7" />
          <stop offset="50%" stopColor="#333" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#appleGradient)" />
      <path
        d="M17.05 12.94c-.03-2.83 2.31-4.19 2.41-4.26-1.31-1.92-3.35-2.18-4.08-2.21-1.73-.18-3.38 1.02-4.26 1.02-.88 0-2.24-.99-3.68-.96-1.89.03-3.63 1.1-4.6 2.79-1.96 3.4-.5 8.43 1.41 11.19.93 1.35 2.05 2.87 3.51 2.82 1.42-.06 1.96-.92 3.68-.92 1.72 0 2.22.92 3.73.89 1.54-.02 2.49-1.37 3.42-2.73 1.08-1.57 1.52-3.09 1.54-3.17-.03-.01-2.96-1.13-2.99-4.5l-.09.04zm-2.55-7.55c.77-.93 1.29-2.22 1.15-3.51-1.11.05-2.45.74-3.24 1.67-.71.82-1.33 2.13-1.16 3.39 1.23.1 2.49-.62 3.25-1.55z"
        fill="white"
      />
    </svg>
  ),

  TSLA: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="teslaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cc0000" />
          <stop offset="100%" stopColor="#dc143c" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#teslaGradient)" />
      <path
        d="M12 4L12 8 L8 12 L12 16 L16 12 L12 8z M12 16L12 20"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="white"
        fontSize="8"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        T
      </text>
    </svg>
  ),

  NVDA: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="nvidiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#76b900" />
          <stop offset="100%" stopColor="#5a8700" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#nvidiaGradient)" />
      <path
        d="M8 8h8l-2 8H6l2-8zm2 2v4h4l1-4h-5z"
        fill="white"
      />
    </svg>
  )
}

// Currency Pair Icons
const CurrencyIcons = {
  EURUSD: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <div className={`flex items-center ${className}`} style={{ width: size, height: size }}>
      <span className="text-blue-500 font-bold text-xs">€</span>
      <span className="text-green-500 font-bold text-xs">$</span>
    </div>
  ),

  GBPUSD: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <div className={`flex items-center ${className}`} style={{ width: size, height: size }}>
      <span className="text-blue-600 font-bold text-xs">£</span>
      <span className="text-green-500 font-bold text-xs">$</span>
    </div>
  ),

  USDJPY: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <div className={`flex items-center ${className}`} style={{ width: size, height: size }}>
      <span className="text-green-500 font-bold text-xs">$</span>
      <span className="text-red-500 font-bold text-xs">¥</span>
    </div>
  ),

  EURGBP: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <div className={`flex items-center ${className}`} style={{ width: size, height: size }}>
      <span className="text-blue-500 font-bold text-xs">€</span>
      <span className="text-blue-600 font-bold text-xs">£</span>
    </div>
  )
}

// Commodity Icons
const CommodityIcons = {
  GOLD: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="50%" stopColor="#ffed4e" />
          <stop offset="100%" stopColor="#d4af37" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#goldGradient)" />
      <path
        d="M12 4l2.5 5h5.5l-4.5 3.5 1.5 5.5-4.5-3.5-4.5 3.5 1.5-5.5-4.5-3.5h5.5z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  ),

  OIL: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="oilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2c2c2c" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#oilGradient)" />
      <path
        d="M8 6h8v2H8V6zm0 3h8v8c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2V9zm2 2v6h4v-6h-4z"
        fill="#ffaa00"
      />
      <ellipse cx="12" cy="14" rx="1.5" ry="3" fill="#cc7700" />
    </svg>
  ),

  NATGAS: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="gasGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4fc3f7" />
          <stop offset="100%" stopColor="#0288d1" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#gasGradient)" />
      <path
        d="M12 4c0 0-6 4-6 8s2.7 6 6 6 6-2.7 6-6-6-8-6-8zm0 12c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"
        fill="white"
        opacity="0.9"
      />
      <circle cx="12" cy="12" r="2" fill="#0288d1" />
    </svg>
  )
}

// Sports Betting Icons - WITH AUTHENTIC BET365 LOGO
const SportsBettingIcons = {
  BET365: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="bet365Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00B85C" />
          <stop offset="50%" stopColor="#00A651" />
          <stop offset="100%" stopColor="#009645" />
        </linearGradient>
        <filter id="bet365Shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>

      {/* Main circle with gradient */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="url(#bet365Gradient)"
        filter="url(#bet365Shadow)"
        stroke="#007A3D"
        strokeWidth="1"
      />

      {/* Inner highlight */}
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />

      {/* "bet" text */}
      <text
        x="50"
        y="42"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="16"
        letterSpacing="-0.5px"
      >
        bet
      </text>

      {/* "365" text */}
      <text
        x="50"
        y="65"
        textAnchor="middle"
        fill="#FFD700"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="20"
        letterSpacing="-1px"
      >
        365
      </text>

      {/* Subtle text shadows for depth */}
      <text
        x="51"
        y="43"
        textAnchor="middle"
        fill="rgba(0,0,0,0.2)"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="16"
        letterSpacing="-0.5px"
      >
        bet
      </text>

      <text
        x="51"
        y="66"
        textAnchor="middle"
        fill="rgba(0,0,0,0.2)"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="20"
        letterSpacing="-1px"
      >
        365
      </text>
    </svg>
  ),

  "22BETS": ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="22betsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#22betsGradient)" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="white"
        fontSize="7"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        22B
      </text>
    </svg>
  ),

  STAKE: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="stakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#stakeGradient)" />
      <path
        d="M8 8h8l-1 2H9l-1-2zm0 4h8l-1 2H9l-1-2zm0 4h6l-1 2h-4l-1-2z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  ),

  PINNACLE: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="pinnacleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#pinnacleGradient)" />
      <path
        d="M6 18L12 6L18 18H16L12 10L8 18H6Z"
        fill="white"
      />
    </svg>
  )
}

// Index and Traditional Assets Icons
const IndexIcons = {
  DJ30: ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="dowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#dowGradient)" />
      <text
        x="12"
        y="14"
        textAnchor="middle"
        fill="white"
        fontSize="6"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        DOW
      </text>
      <text
        x="12"
        y="19"
        textAnchor="middle"
        fill="white"
        fontSize="4"
        fontFamily="Arial, sans-serif"
      >
        30
      </text>
    </svg>
  )
}

// Main Icon Service
export const TradingIconService = {
  // Get icon component for any symbol
  getIcon: (symbol: string, size = 24, className = ""): React.ReactElement => {
    const upperSymbol = symbol.toUpperCase()

    // Check crypto icons first
    if (CryptoIcons[upperSymbol as keyof typeof CryptoIcons]) {
      const IconComponent = CryptoIcons[upperSymbol as keyof typeof CryptoIcons]
      return <IconComponent size={size} className={className} />
    }

    // Check stock icons
    if (StockIcons[upperSymbol as keyof typeof StockIcons]) {
      const IconComponent = StockIcons[upperSymbol as keyof typeof StockIcons]
      return <IconComponent size={size} className={className} />
    }

    // Check currency icons
    if (CurrencyIcons[upperSymbol as keyof typeof CurrencyIcons]) {
      const IconComponent = CurrencyIcons[upperSymbol as keyof typeof CurrencyIcons]
      return <IconComponent size={size} className={className} />
    }

    // Check commodity icons
    if (CommodityIcons[upperSymbol as keyof typeof CommodityIcons]) {
      const IconComponent = CommodityIcons[upperSymbol as keyof typeof CommodityIcons]
      return <IconComponent size={size} className={className} />
    }

    // Check sports betting icons
    if (SportsBettingIcons[upperSymbol as keyof typeof SportsBettingIcons]) {
      const IconComponent = SportsBettingIcons[upperSymbol as keyof typeof SportsBettingIcons]
      return <IconComponent size={size} className={className} />
    }

    // Check index icons
    if (IndexIcons[upperSymbol as keyof typeof IndexIcons]) {
      const IconComponent = IndexIcons[upperSymbol as keyof typeof IndexIcons]
      return <IconComponent size={size} className={className} />
    }

    // Fallback to text-based icon
    return <DefaultIcon symbol={upperSymbol} size={size} className={className} />
  },

  // Check if we have a custom icon
  hasCustomIcon: (symbol: string): boolean => {
    const upperSymbol = symbol.toUpperCase()
    return !!(
      CryptoIcons[upperSymbol as keyof typeof CryptoIcons] ||
      StockIcons[upperSymbol as keyof typeof StockIcons] ||
      CurrencyIcons[upperSymbol as keyof typeof CurrencyIcons] ||
      CommodityIcons[upperSymbol as keyof typeof CommodityIcons] ||
      SportsBettingIcons[upperSymbol as keyof typeof SportsBettingIcons] ||
      IndexIcons[upperSymbol as keyof typeof IndexIcons]
    )
  }
}

// Default fallback icon component
const DefaultIcon = ({ symbol, size, className }: { symbol: string; size: number; className: string }) => (
  <div
    className={`flex items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-white font-bold ${className}`}
    style={{ width: size, height: size, fontSize: Math.floor(size / 3) }}
  >
    {symbol.substring(0, 2)}
  </div>
)

// React component wrapper for easy usage
export const TradingIcon: React.FC<TradingIconProps> = ({
  symbol,
  size = 24,
  className = ""
}) => {
  return TradingIconService.getIcon(symbol, size, className)
}

export default TradingIcon
