import express, { type Request, type Response } from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import { authenticateToken, type AuthedRequest } from './middleware/authenticateToken'
import { Portfolio } from './models/Portfolio'
import { Trade } from './models/Trade'
import { UserProfile } from './models/UserProfile'
import { cacheWrap, getRedis } from './lib/redis'


const app = express()
const PORT = parseInt(process.env.PORT || '5000', 10)
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.warn('MONGODB_URI is not set. Set it in .env to connect to MongoDB Atlas.')
}

// side-effect import to initialize Firebase Admin
import './firebase-admin-config'

// Middleware
const allowedOrigins = CORS_ORIGIN.split(',').map((s) => s.trim())
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl) or if in list
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)
app.use(express.json())

// Health check
app.get('/api/health', async (_req: Request, res: Response) => {
  const status: any = { ok: true, uptime: process.uptime() }
  try {
    const pong = await getRedis().ping()
    status.redis = pong === 'PONG'
  } catch {
    status.redis = false
  }
  res.json(status)
})

// Public: Crypto OHLC via Binance proxy
// GET /api/market/ohlc?symbol=BTCUSDT&interval=1h&limit=500
app.get('/api/market/ohlc', async (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || 'BTCUSDT'
    const interval = (req.query.interval as string) || '1h'
    const limitRaw = parseInt((req.query.limit as string) || '200', 10)
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 1000) : 200
    const cacheKey = `ohlc:${symbol}:${interval}:${limit}`
    const data = await cacheWrap(cacheKey, 15, async () => {
      const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`
      const r = await fetch(url)
      if (!r.ok) {
        const text = await r.text().catch(() => '')
        throw new Error(text || `Upstream error ${r.status}`)
      }
      const raw = (await r.json()) as any[]
      return raw.map((k: any[]) => ({
        time: Math.floor(k[0] / 1000),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }))
    })
  res.set('Cache-Control', 'public, max-age=15')
  res.json({ symbol, interval, data })
  } catch (e: any) {
    console.error('OHLC proxy error:', e)
    res.status(500).json({ message: 'Failed to fetch OHLC data' })
  }
})

// Public: Crypto tickers (24hr stats)
// GET /api/market/tickers?symbols=BTCUSDT,ETHUSDT,SOLUSDT
app.get('/api/market/tickers', async (req: Request, res: Response) => {
  try {
    const symbolsParam = (req.query.symbols as string) || ''
    const list = symbolsParam
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)

    if (list.length === 0) {
      return res.status(400).json({ message: 'symbols query parameter is required (comma-separated)' })
    }

    const cacheKey = `tickers:${list.sort().join(',')}`
    const data = await cacheWrap(cacheKey, 10, async () => {
      const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(list))}`
      const r = await fetch(url)
      if (!r.ok) {
        const text = await r.text().catch(() => '')
        throw new Error(text || `Upstream error ${r.status}`)
      }
      const raw = (await r.json()) as any[]
      return raw.map((t) => ({
        symbol: t.symbol as string,
        lastPrice: parseFloat(t.lastPrice),
        priceChangePercent: parseFloat(t.priceChangePercent),
        highPrice: parseFloat(t.highPrice),
        lowPrice: parseFloat(t.lowPrice),
        volume: parseFloat(t.volume),
      }))
    })
  res.set('Cache-Control', 'public, max-age=10')
  res.json({ data })
  } catch (e) {
    console.error('Tickers proxy error:', e)
    res.status(500).json({ message: 'Failed to fetch tickers' })
  }
})

// Public: List available symbols (filter by quote asset, default USDT)
// GET /api/market/symbols?quote=USDT
app.get('/api/market/symbols', async (req: Request, res: Response) => {
  try {
    const quote = ((req.query.quote as string) || 'USDT').toUpperCase()
    const cacheKey = `symbols:${quote}`
    const data = await cacheWrap(cacheKey, 60 * 60 * 12, async () => {
      const url = 'https://api.binance.com/api/v3/exchangeInfo'
      const r = await fetch(url)
      if (!r.ok) {
        const text = await r.text().catch(() => '')
        throw new Error(text || `Upstream error ${r.status}`)
      }
      const json = (await r.json()) as any
      const symbols = (json.symbols || []) as any[]
      return symbols
        .filter((s) => s.status === 'TRADING' && s.isSpotTradingAllowed && s.quoteAsset === quote)
        .map((s) => ({ symbol: s.symbol as string, baseAsset: s.baseAsset as string, quoteAsset: s.quoteAsset as string }))
    })
  res.set('Cache-Control', 'public, max-age=43200')
  res.json({ data })
  } catch (e) {
    console.error('Symbols proxy error:', e)
    res.status(500).json({ message: 'Failed to fetch symbols' })
  }
})

// Secure: Leaderboard - top users by equity (balance + positions value)
// GET /api/leaderboard?limit=4
app.get('/api/leaderboard', authenticateToken, async (req: AuthedRequest, res: Response) => {
  try {
    const limitRaw = parseInt((req.query.limit as string) || '4', 10)
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 20) : 4
    const portfolios = await cacheWrap('leaderboard:portfolios:v1', 45, async () => {
      const docs = await Portfolio.find({}).lean()
      return docs as any
    })
    if (portfolios.length === 0) return res.json({ top: [], you: null })

    // Collect unique symbols
    const unique = new Set<string>()
    for (const p of portfolios) {
      const map = p.portfolio as any
      for (const [sym, qty] of map instanceof Map ? map.entries() : Object.entries(map || {})) {
        if ((qty || 0) > 0 && typeof sym === 'string' && sym.toUpperCase().endsWith('USDT')) unique.add(sym.toUpperCase())
      }
    }
    const list = Array.from(unique)

    // Fetch prices
    const priceMap: Record<string, number> = {}
    if (list.length > 0) {
      const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(list))}`
      const r = await fetch(url)
      if (r.ok) {
        const raw = (await r.json()) as any[]
        raw.forEach((t) => { priceMap[t.symbol] = parseFloat(t.lastPrice) })
      }
    }

    const START_BALANCE = 100000
    const rows = portfolios.map((p: any) => {
      const map = p.portfolio as any
      let positionsValue = 0
      for (const [sym, qty] of map instanceof Map ? map.entries() : Object.entries(map || {})) {
        const s = String(sym).toUpperCase()
        const q = Number(qty) || 0
        const px = priceMap[s]
        if (q > 0 && px > 0) positionsValue += q * px
      }
      const equity = (p.balance || 0) + positionsValue
      const retPct = ((equity - START_BALANCE) / START_BALANCE) * 100
      return { userId: p.userId, equity, returnPct: retPct }
    })

  rows.sort((a: { userId: string; equity: number; returnPct: number }, b: { userId: string; equity: number; returnPct: number }) => b.equity - a.equity)
  const top = rows.slice(0, limit)

    // Attach display names
    const userIds = Array.from(new Set(rows.map((r: { userId: string }) => r.userId)))
    const profiles = await cacheWrap(`profiles:batch:${userIds.sort().join(',')}`, 60, async () => {
      const docs = await UserProfile.find({ userId: { $in: userIds } }).lean()
      return docs as any
    })
    const nameMap = new Map<string, string | undefined>()
    ;(profiles as Array<{ userId: string; displayName?: string }>).forEach((p) => nameMap.set(p.userId, p.displayName))

    const uid = req.user!.uid
    const youIdx = rows.findIndex((r: { userId: string }) => r.userId === uid)
    const you = youIdx >= 0 ? { ...rows[youIdx], rank: youIdx + 1, displayName: nameMap.get(uid) } : null

    const topWithNames = top.map((r: { userId: string; equity: number; returnPct: number; rank?: number }) => ({ ...r, displayName: nameMap.get(r.userId) }))

    res.json({ top: topWithNames, you })
  } catch (e) {
    console.error('Leaderboard error:', e)
    res.status(500).json({ message: 'Failed to compute leaderboard' })
  }
})

// Secure: User profile
// GET /api/profile -> { userId, displayName, photoURL }
app.get('/api/profile', authenticateToken, async (req: AuthedRequest, res: Response) => {
  try {
    const uid = req.user!.uid
    let profile = await UserProfile.findOne({ userId: uid })
    if (!profile) {
      profile = await UserProfile.create({ userId: uid })
    }
    res.json(profile.toObject())
  } catch (e) {
    console.error('Profile fetch error:', e)
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
})

// POST /api/profile { displayName?, photoURL? }
app.post('/api/profile', authenticateToken, async (req: AuthedRequest, res: Response) => {
  try {
    const uid = req.user!.uid
    const { displayName, photoURL } = req.body as { displayName?: string; photoURL?: string }
    const updated = await UserProfile.findOneAndUpdate(
      { userId: uid },
      { $set: { displayName, photoURL } },
      { upsert: true, new: true }
    )
    res.json({ message: 'Profile saved', data: updated.toObject() })
  } catch (e) {
    console.error('Profile save error:', e)
    res.status(500).json({ message: 'Failed to save profile' })
  }
})

// Secure routes
app.get('/api/portfolio', authenticateToken, async (req: AuthedRequest, res: Response) => {
  try {
    const uid = req.user!.uid
    let portfolio = await Portfolio.findOne({ userId: uid })
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: uid })
    }
    res.json(portfolio.toObject())
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    res.status(500).json({ message: 'Failed to fetch portfolio data.' })
  }
})

app.post('/api/portfolio', authenticateToken, async (req: AuthedRequest, res: Response) => {
  const body = (req as any).body as { balance?: number; portfolio?: Record<string, number> }
  const { balance, portfolio } = body
  if (balance === undefined || portfolio === undefined) {
    return res.status(400).json({ message: 'Missing balance or portfolio data.' })
  }
  try {
    const uid = req.user!.uid
    const updated = await Portfolio.findOneAndUpdate(
      { userId: uid },
      { $set: { balance, portfolio } },
      { upsert: true, new: true, runValidators: true }
    )
    res.json({ message: 'Portfolio saved successfully.', data: updated!.toObject() })
  } catch (error) {
    console.error('Error saving portfolio:', error)
    res.status(500).json({ message: 'Failed to save portfolio data.' })
  }
})

// Secure: Trades endpoints
// GET /api/trades?limit=20 - recent trades
app.get('/api/trades', authenticateToken, async (req: AuthedRequest, res: Response) => {
  try {
    const uid = req.user!.uid
    const limitRaw = parseInt((req.query.limit as string) || '20', 10)
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 20
    const trades = await Trade.find({ userId: uid }).sort({ createdAt: -1 }).limit(limit)
    res.json({ data: trades })
  } catch (e) {
    console.error('Error fetching trades:', e)
    res.status(500).json({ message: 'Failed to fetch trades.' })
  }
})

// POST /api/trades - create a trade (for demo/testing)
// body: { symbol, side: 'BUY'|'SELL', quantity: number, price?: number, status?: 'completed'|'pending'|'cancelled' }
app.post('/api/trades', authenticateToken, async (req: AuthedRequest, res: Response) => {
  try {
    const uid = req.user!.uid
    const { symbol, side, quantity, price } = req.body as {
      symbol?: string; side?: 'BUY'|'SELL'; quantity?: number; price?: number
    }
    if (!symbol || !side || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Missing or invalid symbol/side/quantity' })
    }
    const sym = symbol.toUpperCase()
    const px = typeof price === 'number' ? price : 0
    if (!(px > 0)) {
      return res.status(400).json({ message: 'Missing or invalid price' })
    }

    // Load or create portfolio
    let portfolio = await Portfolio.findOne({ userId: uid })
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: uid })
    }

  const cost = quantity * px
  const currentQty = (portfolio.portfolio.get(sym) as number | undefined) || 0
  const currentAvg = (portfolio.avgPrices?.get(sym) as number | undefined) || 0

    if (side === 'BUY') {
      if (portfolio.balance < cost) {
        return res.status(400).json({ message: 'Insufficient balance' })
      }
      portfolio.balance = portfolio.balance - cost
      const newQty = currentQty + quantity
      // weighted average price update
      const newAvg = currentQty > 0 ? ((currentAvg * currentQty) + (px * quantity)) / newQty : px
      portfolio.portfolio.set(sym, newQty)
      portfolio.avgPrices?.set(sym, newAvg)
    } else if (side === 'SELL') {
      if (currentQty < quantity) {
        return res.status(400).json({ message: 'Insufficient holdings' })
      }
      portfolio.balance = portfolio.balance + cost
      const newQty = currentQty - quantity
      // realized PnL using average cost basis
      const realized = (px - currentAvg) * quantity
      portfolio.realizedPnl = (portfolio.realizedPnl || 0) + realized
      if (newQty > 0) {
        portfolio.portfolio.set(sym, newQty)
        portfolio.avgPrices?.set(sym, currentAvg)
      } else {
        portfolio.portfolio.delete(sym)
        portfolio.avgPrices?.delete(sym)
      }
    }

    await portfolio.save()

    const trade = await Trade.create({
      userId: uid,
      symbol: sym,
      side,
      quantity,
      price: px,
      status: 'completed',
    })
    const payload = trade.toObject() as any
    if (side === 'SELL') {
      const realized = (px - currentAvg) * quantity
      payload.realizedProfit = realized
    } else {
      payload.realizedProfit = 0
    }
    res.status(201).json({ message: 'Trade recorded', data: payload })
  } catch (e) {
    console.error('Error creating trade:', e)
    res.status(500).json({ message: 'Failed to create trade.' })
  }
})

async function start() {
  if (!MONGODB_URI) {
    console.error('Cannot start server without MONGODB_URI')
    process.exit(1)
  }
  await mongoose.connect(MONGODB_URI)
  console.log('MongoDB connected')
  app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`)
  })
}

start().catch((e) => {
  console.error('Fatal startup error:', e)
  process.exit(1)
})
