// Live Market Data API Service - Real-time integration with CoinGecko and other providers

export interface LiveMarketData {
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  marketCap: number
  sparklineData: number[]
  lastUpdated: Date
  source: 'coingecko' | 'binance' | 'mock'
}

export interface APIConfig {
  baseURL: string
  rateLimitMs: number
  maxRetries: number
  timeout: number
}

class LiveMarketAPIService {
  private readonly COINGECKO_CONFIG: APIConfig = {
    baseURL: 'https://api.coingecko.com/api/v3',
    rateLimitMs: 10000, // Increased rate limit for stability
    maxRetries: 2, // Reduced retries for faster fallback
    timeout: 8000 // Reduced timeout
  }

  // Cache to prevent excessive API calls
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private lastApiCall = 0
  private rateLimitQueue: Array<() => void> = []
  private isProcessingQueue = false

  // Asset mapping for different sources
  private readonly ASSET_MAPPING = {
    'BTC': { coingecko: 'bitcoin', symbol: 'BTC', type: 'crypto' },
    'ETH': { coingecko: 'ethereum', symbol: 'ETH', type: 'crypto' },
    'SOL': { coingecko: 'solana', symbol: 'SOL', type: 'crypto' },
    'TRX': { coingecko: 'tron', symbol: 'TRX', type: 'crypto' },
    'ADA': { coingecko: 'cardano', symbol: 'ADA', type: 'crypto' },
    'DOT': { coingecko: 'polkadot', symbol: 'DOT', type: 'crypto' },
    'MATIC': { coingecko: 'matic-network', symbol: 'MATIC', type: 'crypto' },
    'DOGE': { coingecko: 'dogecoin', symbol: 'DOGE', type: 'crypto' },
    'LTC': { coingecko: 'litecoin', symbol: 'LTC', type: 'crypto' },
    'LINK': { coingecko: 'chainlink', symbol: 'LINK', type: 'crypto' }
  } as const

  // Rate limiting helper
  private async rateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastCall = now - this.lastApiCall

    if (timeSinceLastCall < this.COINGECKO_CONFIG.rateLimitMs) {
      const waitTime = this.COINGECKO_CONFIG.rateLimitMs - timeSinceLastCall
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    this.lastApiCall = Date.now()
  }

  // Enhanced fetch with timeout and retry logic
  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.COINGECKO_CONFIG.timeout)

    for (let attempt = 1; attempt <= this.COINGECKO_CONFIG.maxRetries; attempt++) {
      try {
        await this.rateLimit()

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AdminDashboard/1.0',
            ...options.headers
          }
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          // Handle rate limiting
          if (response.status === 429) {
            console.warn(`Rate limited, using fallback data`)
            throw new Error('Rate limited')
          }

          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return data
      } catch (error) {
        console.warn(`API call attempt ${attempt}/${this.COINGECKO_CONFIG.maxRetries} failed:`, error)

        if (attempt === this.COINGECKO_CONFIG.maxRetries) {
          throw error
        }

        // Exponential backoff
        const delay = Math.min(1000 * (2 ** (attempt - 1)), 5000) // Capped at 5s
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  // Get live crypto data from CoinGecko WITH IMMEDIATE FALLBACK
  async getLiveCryptoData(symbols: string[] = ['BTC', 'ETH', 'SOL', 'TRX', 'ADA']): Promise<LiveMarketData[]> {
    try {
      // Check cache first for faster loading
      const cacheKey = `crypto-${symbols.join(',')}`
      const cached = this.cache.get(cacheKey)
      const now = Date.now()

      if (cached && (now - cached.timestamp) < 60000) { // 1 minute cache
        console.log('✅ Using cached crypto data')
        return this.formatCryptoData(cached.data, symbols)
      }

      // Map symbols to CoinGecko IDs
      const coinIds = symbols
        .map(symbol => this.ASSET_MAPPING[symbol as keyof typeof this.ASSET_MAPPING]?.coingecko)
        .filter(Boolean)

      if (coinIds.length === 0) {
        console.warn('No valid symbols provided, using mock data')
        return this.getMockCryptoData(symbols)
      }

      console.log('🔄 Fetching live crypto data from CoinGecko...')

      // Fetch current prices and market data with timeout protection
      const pricesUrl = `${this.COINGECKO_CONFIG.baseURL}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true`

      const pricesData = await Promise.race([
        this.fetchWithRetry(pricesUrl),
        new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 5000))
      ])

      // Cache the result immediately
      const combinedData = { prices: pricesData, coins: [] }
      this.cache.set(cacheKey, { data: combinedData, timestamp: now })

      console.log('✅ Successfully fetched live crypto data')
      return this.formatCryptoData(combinedData, symbols)

    } catch (error) {
      console.error('❌ Error fetching live crypto data, using fallback:', error)

      // Return cached data if available, even if expired
      const cacheKey = `crypto-${symbols.join(',')}`
      const cached = this.cache.get(cacheKey)
      if (cached) {
        console.warn('⚠️ Using expired cache due to API error')
        return this.formatCryptoData(cached.data, symbols)
      }

      // Always fallback to mock data to ensure UI functionality
      console.log('🔄 Using realistic mock data as fallback')
      return this.getMockCryptoData(symbols)
    }
  }

  // Format and normalize crypto data
  private formatCryptoData(data: any, requestedSymbols: string[]): LiveMarketData[] {
    const { prices } = data

    return requestedSymbols.map(symbol => {
      const mapping = this.ASSET_MAPPING[symbol as keyof typeof this.ASSET_MAPPING]
      if (!mapping) {
        return this.getMockDataForSymbol(symbol)
      }

      const priceData = prices?.[mapping.coingecko]

      if (!priceData) {
        return this.getMockDataForSymbol(symbol)
      }

      // Generate realistic sparkline data
      const basePrice = priceData.usd || 1
      const changePercent = priceData.usd_24h_change || 0
      const sparklineData = this.generateRealisticSparkline(basePrice, changePercent)

      return {
        symbol: symbol,
        name: this.getAssetName(symbol),
        price: priceData.usd || 0,
        change24h: priceData.usd_24h_change || 0,
        changePercent24h: priceData.usd_24h_change || 0,
        volume24h: priceData.usd_24h_vol || 0,
        marketCap: priceData.usd_market_cap || 0,
        sparklineData: sparklineData,
        lastUpdated: new Date(priceData.last_updated_at ? priceData.last_updated_at * 1000 : Date.now()),
        source: 'coingecko'
      }
    })
  }

  // Generate realistic sparkline data based on price and change
  private generateRealisticSparkline(basePrice: number, changePercent: number): number[] {
    const data: number[] = []
    const trend = changePercent > 0 ? 1 : -1
    let value = 100 // Normalized starting point

    for (let i = 0; i < 20; i++) {
      const randomVariation = (Math.random() - 0.5) * 2 // ±1% random
      const trendInfluence = (i / 20) * trend * Math.abs(changePercent * 0.5)
      const momentum = i > 10 ? trend * 0.5 : 0 // Add momentum in second half

      value += randomVariation + trendInfluence + momentum
      value = Math.max(95, Math.min(105, value)) // Keep within reasonable bounds
      data.push(value)
    }

    return data
  }

  // Get asset display name
  private getAssetName(symbol: string): string {
    const names: Record<string, string> = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'SOL': 'Solana',
      'TRX': 'Tron',
      'ADA': 'Cardano',
      'DOT': 'Polkadot',
      'MATIC': 'Polygon',
      'DOGE': 'Dogecoin',
      'LTC': 'Litecoin',
      'LINK': 'Chainlink',
      'DJ30': 'Dow Jones 30',
      'EURUSD': 'EUR/USD',
      'OIL': 'Crude Oil',
      'GOLD': 'Gold'
    }
    return names[symbol] || symbol
  }

  // Get traditional assets (forex, commodities, indices) with enhanced mock data
  async getTraditionalAssetsData(): Promise<LiveMarketData[]> {
    console.log('📊 Loading traditional assets data...')

    return [
      {
        symbol: 'DJ30',
        name: 'Dow Jones 30',
        price: 42229.55 + (Math.random() - 0.5) * 200,
        change24h: 245.67 + (Math.random() - 0.5) * 100,
        changePercent24h: 1.11 + (Math.random() - 0.5) * 0.8,
        volume24h: 0,
        marketCap: 0,
        sparklineData: this.generateRealisticSparkline(42229, 1.11),
        lastUpdated: new Date(),
        source: 'mock'
      },
      {
        symbol: 'EURUSD',
        name: 'EUR/USD',
        price: 1.15172 + (Math.random() - 0.5) * 0.02,
        change24h: 0.002 + (Math.random() - 0.5) * 0.002,
        changePercent24h: 0.17 + (Math.random() - 0.5) * 0.2,
        volume24h: 0,
        marketCap: 0,
        sparklineData: this.generateRealisticSparkline(1.15, 0.17),
        lastUpdated: new Date(),
        source: 'mock'
      },
      {
        symbol: 'OIL',
        name: 'Crude Oil',
        price: 73.99 + (Math.random() - 0.5) * 4,
        change24h: 0.52 + (Math.random() - 0.5) * 2,
        changePercent24h: 0.07 + (Math.random() - 0.5) * 1,
        volume24h: 0,
        marketCap: 0,
        sparklineData: this.generateRealisticSparkline(74, 0.07),
        lastUpdated: new Date(),
        source: 'mock'
      },
      {
        symbol: 'GOLD',
        name: 'Gold',
        price: 3367.97 + (Math.random() - 0.5) * 40,
        change24h: -2.7 + (Math.random() - 0.5) * 10,
        changePercent24h: -0.08 + (Math.random() - 0.5) * 0.4,
        volume24h: 0,
        marketCap: 0,
        sparklineData: this.generateRealisticSparkline(3368, -0.08),
        lastUpdated: new Date(),
        source: 'mock'
      }
    ]
  }

  // Enhanced mock data for symbols
  private getMockDataForSymbol(symbol: string): LiveMarketData {
    const mockPrices: Record<string, any> = {
      'BTC': { price: 43250, change: 2.1, name: 'Bitcoin' },
      'ETH': { price: 2239, change: -1.23, name: 'Ethereum' },
      'SOL': { price: 98.45, change: 3.7, name: 'Solana' },
      'TRX': { price: 0.1234, change: -1.2, name: 'Tron' },
      'ADA': { price: 0.45, change: 1.8, name: 'Cardano' },
      'DOT': { price: 7.23, change: -2.1, name: 'Polkadot' },
      'MATIC': { price: 0.92, change: 4.2, name: 'Polygon' },
      'DOGE': { price: 0.08, change: 5.3, name: 'Dogecoin' },
      'LTC': { price: 72.34, change: -0.8, name: 'Litecoin' },
      'LINK': { price: 14.56, change: 2.9, name: 'Chainlink' }
    }

    const mock = mockPrices[symbol] || { price: 1, change: 0, name: symbol }
    const variation = (Math.random() - 0.5) * 0.2 // Increased variation for more realistic movement
    const price = mock.price * (1 + variation / 100)
    const changePercent = mock.change + (Math.random() - 0.5) * 1

    return {
      symbol,
      name: mock.name,
      price,
      change24h: price * (changePercent / 100),
      changePercent24h: changePercent,
      volume24h: Math.random() * 1000000000,
      marketCap: price * Math.random() * 1000000000,
      sparklineData: this.generateRealisticSparkline(price, changePercent),
      lastUpdated: new Date(),
      source: 'mock'
    }
  }

  // Mock data fallback
  private getMockCryptoData(symbols: string[]): LiveMarketData[] {
    console.log(`🔄 Generating mock data for symbols: ${symbols.join(', ')}`)
    return symbols.map(symbol => this.getMockDataForSymbol(symbol))
  }

  // Get all market data (crypto + traditional assets) with better error handling
  async getAllMarketData(): Promise<LiveMarketData[]> {
    try {
      console.log('📈 Loading all market data...')

      // Try to get real crypto data, fallback to mock if needed
      const cryptoDataPromise = this.getLiveCryptoData(['BTC', 'ETH', 'SOL', 'TRX', 'ADA', 'DOT', 'MATIC'])
      const traditionalDataPromise = this.getTraditionalAssetsData()

      const [cryptoData, traditionalData] = await Promise.allSettled([
        cryptoDataPromise,
        traditionalDataPromise
      ])

      const finalCryptoData = cryptoData.status === 'fulfilled' ? cryptoData.value : this.getMockCryptoData(['BTC', 'ETH', 'SOL', 'TRX', 'ADA'])
      const finalTraditionalData = traditionalData.status === 'fulfilled' ? traditionalData.value : []

      const allData = [...finalTraditionalData, ...finalCryptoData]
      console.log(`✅ Loaded ${allData.length} market items successfully`)

      return allData
    } catch (error) {
      console.error('❌ Error fetching all market data, using complete fallback:', error)
      return this.getMockAllData()
    }
  }

  private getMockAllData(): LiveMarketData[] {
    console.log('🎯 Generating mock market data for banners...')
    const mockData = [
      {
        symbol: 'DJ30',
        name: 'Dow Jones 30',
        price: 42429.12,
        change24h: 234.56,
        changePercent24h: 0.56,
        volume24h: 0,
        marketCap: 0,
        sparklineData: [100, 101, 100, 102, 101, 103, 102, 104, 103, 105],
        lastUpdated: new Date(),
        source: 'mock' as const
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 67250.00,
        change24h: -1250.50,
        changePercent24h: -1.83,
        volume24h: 28500000000,
        marketCap: 1320000000000,
        sparklineData: [100, 102, 104, 103, 105, 107, 106, 108, 107, 109],
        lastUpdated: new Date(),
        source: 'mock' as const
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: 2239.45,
        change24h: -27.55,
        changePercent24h: -1.23,
        volume24h: 15400000000,
        marketCap: 269000000000,
        sparklineData: [100, 99, 98, 97, 99, 98, 97, 96, 98, 97],
        lastUpdated: new Date(),
        source: 'mock' as const
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        price: 98.45,
        change24h: 3.52,
        changePercent24h: 3.7,
        volume24h: 2100000000,
        marketCap: 44000000000,
        sparklineData: [100, 102, 104, 103, 105, 107, 106, 108, 107, 109],
        lastUpdated: new Date(),
        source: 'mock' as const
      },
      {
        symbol: 'EURUSD',
        name: 'Euro/US Dollar',
        price: 1.08234,
        change24h: 0.00123,
        changePercent24h: 0.11,
        volume24h: 0,
        marketCap: 0,
        sparklineData: [100, 100.1, 100.05, 100.15, 100.08, 100.12, 100.07, 100.18, 100.11, 100.14],
        lastUpdated: new Date(),
        source: 'mock' as const
      },
      {
        symbol: 'GOLD',
        name: 'Gold',
        price: 2034.50,
        change24h: 12.30,
        changePercent24h: 0.61,
        volume24h: 0,
        marketCap: 0,
        sparklineData: [100, 101, 100.5, 101.5, 100.8, 101.2, 100.7, 101.8, 101.1, 101.4],
        lastUpdated: new Date(),
        source: 'mock' as const
      }
    ]
    console.log(`✅ Generated ${mockData.length} mock market items`)
    return mockData
  }

  // Check API health with faster response
  async checkAPIHealth(): Promise<{ status: 'healthy' | 'degraded' | 'down', latency: number }> {
    const startTime = Date.now()

    try {
      const response = await Promise.race([
        this.fetchWithRetry(`${this.COINGECKO_CONFIG.baseURL}/ping`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), 3000))
      ])

      const latency = Date.now() - startTime

      if (response && typeof response === 'object') {
        return { status: 'healthy', latency }
      } else {
        return { status: 'degraded', latency }
      }
    } catch (error) {
      return { status: 'down', latency: Date.now() - startTime }
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
    console.log('🗑️ API cache cleared')
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[]; oldestEntry: number } {
    let oldestTimestamp = Date.now()

    for (const [, value] of this.cache) {
      if (value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp
      }
    }

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      oldestEntry: oldestTimestamp
    }
  }
}

export const liveMarketAPI = new LiveMarketAPIService()
