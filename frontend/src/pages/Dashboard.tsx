// import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Trophy, 
  Search,
  Settings,
  Bell,
  User as UserIcon,
  Wallet,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Trash2
} from 'lucide-react';
import { BsLightningChargeFill } from 'react-icons/bs'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { getPortfolio, getTickers, getTrades, getSymbols, createTrade, getLeaderboard, type Ticker, type Trade, type MarketSymbol, type LeaderboardRow } from '@/lib/api'
import CryptoChart, { type Candle } from '@/components/CryptoChart'

const Dashboard = () => {
  // portfolioData will be computed later from live values

  const defaultWatchlist = ['BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT']
  const [watchlist, setWatchlist] = useState<string[]>(defaultWatchlist)
  const [tickers, setTickers] = useState<Record<string, Ticker>>({})
  const [watchlistInput, setWatchlistInput] = useState('')
  const [symbols, setSymbols] = useState<MarketSymbol[]>([])

  const [recentTrades, setRecentTrades] = useState<Trade[] | null>(null)

  const [leaderboardTop, setLeaderboardTop] = useState<LeaderboardRow[] | null>(null)
  const [leaderboardYou, setLeaderboardYou] = useState<LeaderboardRow | null>(null)

  const [serverBalance, setServerBalance] = useState<number | null>(null)
  const [holdings, setHoldings] = useState<Record<string, number>>({})
  const [avgPrices, setAvgPrices] = useState<Record<string, number>>({})
  const [realizedPnl, setRealizedPnl] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [candles, setCandles] = useState<Candle[] | null>(null)
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [interval, setInterval] = useState('1h')
  const [tradeSymbol, setTradeSymbol] = useState('BTCUSDT')
  const [tradeQty, setTradeQty] = useState<number>(100)
  const [tradeSubmitting, setTradeSubmitting] = useState<null | 'BUY' | 'SELL'>(null)
  type ToastKind = 'success' | 'error' | 'info'
  const [toasts, setToasts] = useState<{ id: number; kind: ToastKind; message: string }[]>([])
  const pushToast = (kind: ToastKind, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, kind, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  // Load/save watchlist from localStorage per-user
  const { user } = useAuth()
  const storageKey = `watchlist:${user?.uid || 'guest'}`

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr) && arr.every((s) => typeof s === 'string')) {
          setWatchlist(arr)
        }
      }
    } catch {/* ignore */}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(watchlist))
    } catch {/* ignore */}
  }, [storageKey, watchlist])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
  const p = await getPortfolio()
        if (!mounted) return
  setServerBalance(p.balance)
  setHoldings(p.portfolio || {})
  setAvgPrices((p as any).avgPrices || {})
  setRealizedPnl((p as any).realizedPnl || 0)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to load portfolio')
      } finally {
        // no-op
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000'
        const qs = new URLSearchParams({ symbol, interval, limit: '500' })
        const res = await fetch(`${base}/api/market/ohlc?${qs}`)
        const json = await res.json()
        if (!mounted) return
        setCandles(json.data as Candle[])
      } catch (e) {
        if (!mounted) return
        setError('Failed to load market data')
      }
    })()
    return () => { mounted = false }
  }, [symbol, interval])

  // Fetch recent trades for the authed user
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const r = await getTrades(20)
        if (!mounted) return
        setRecentTrades(r.data)
      } catch (e) {
        if (!mounted) return
        setRecentTrades([])
      }
    })()
    return () => { mounted = false }
  }, [])

  // Fetch leaderboard
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { top, you } = await getLeaderboard(4)
        if (!mounted) return
        setLeaderboardTop(top)
        setLeaderboardYou(you)
      } catch (e) {
        if (!mounted) return
        setLeaderboardTop([])
        setLeaderboardYou(null)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Fetch list of available symbols (USDT pairs) for suggestions
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const list = await getSymbols('USDT')
        if (!mounted) return
        setSymbols(list)
      } catch {}
    })()
    return () => { mounted = false }
  }, [])

  // Fetch tickers for union of watchlist and crypto holdings periodically
  useEffect(() => {
  let mounted = true
  let timer: number | undefined
    const fetchTickers = async () => {
      try {
        const holdingSymbols = Object.entries(holdings)
          .filter(([, qty]) => (qty || 0) > 0)
          .map(([sym]) => sym.toUpperCase())
          .filter((sym) => sym.endsWith('USDT'))
        const uniqueSymbols = Array.from(new Set([...(watchlist || []), ...holdingSymbols]))
        if (uniqueSymbols.length === 0) return
        const data = await getTickers(uniqueSymbols)
        if (!mounted) return
        const map: Record<string, Ticker> = {}
        data.forEach((t) => { map[t.symbol] = t })
        setTickers(map)
      } catch (e) {
        if (!mounted) return
        // do not spam error; keep silent
      }
    }
    fetchTickers()
    timer = window.setInterval(fetchTickers, 15000)
    return () => { mounted = false; if (timer !== undefined) window.clearInterval(timer) }
  }, [watchlist, holdings])

  // Ensure tradeSymbol stays valid if watchlist changes
  useEffect(() => {
    if (watchlist.length === 0) {
      if (tradeSymbol !== '') setTradeSymbol('')
      return
    }
    if (!watchlist.includes(tradeSymbol)) {
      setTradeSymbol(watchlist[0])
    }
  }, [watchlist, tradeSymbol])

  // Derived metrics from holdings and tickers
  const activePositions = Object.values(holdings).filter((q) => (q || 0) > 0).length
  const holdingsSymbols = Object.entries(holdings).filter(([, q]) => (q || 0) > 0).map(([s]) => s.toUpperCase())
  const holdingsMarketValue = holdingsSymbols.reduce((acc, s) => {
    const t = tickers[s]
    if (!t) return acc
    const qty = holdings[s] || holdings[s.toUpperCase()] || 0
    return acc + qty * t.lastPrice
  }, 0)
  const unrealizedPnl = holdingsSymbols.reduce((acc, s) => {
    const t = tickers[s]
    if (!t) return acc
    const qty = holdings[s] || holdings[s.toUpperCase()] || 0
    const avg = avgPrices[s] || avgPrices[s.toUpperCase()] || 0
    if (avg > 0) return acc + qty * (t.lastPrice - avg)
    // fallback to 24h change approximation when avg unknown
    return acc + qty * t.lastPrice * (t.priceChangePercent / 100)
  }, 0)
  const totalPnl = (realizedPnl || 0) + unrealizedPnl
  const totalPnlPct = holdingsMarketValue > 0 ? (unrealizedPnl / holdingsMarketValue) * 100 : 0
  // Win rate from completed trades (simple proxy)
  const completed = (recentTrades || []).filter((t) => t.status === 'completed')
  const tradeWins = completed.filter((t) => {
    const curr = tickers[t.symbol]?.lastPrice
    if (!curr) return false
    return t.side === 'BUY' ? curr > t.price : t.price > curr
  }).length
  const winRate = completed.length > 0 ? (tradeWins / completed.length) * 100 : 0

  const portfolioData = [
    {
      label: 'Virtual Balance',
      value: serverBalance !== null
        ? `$${serverBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '—',
      change: `${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}`,
      trend: totalPnl >= 0 ? 'up' as const : 'down' as const,
    },
    {
      label: 'Total P&L',
      value: `${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toFixed(2)}`,
      change: `${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`,
      trend: totalPnl >= 0 ? 'up' as const : 'down' as const,
    },
    {
      label: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      change: `${winRate.toFixed(1)}%`,
      trend: winRate >= 50 ? 'up' as const : 'down' as const,
    },
    {
      label: 'Active Positions',
      value: `${activePositions}`,
      change: '',
      trend: 'up' as const,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[100] space-y-2">
          {toasts.map((t) => (
            <ToastItem key={t.id} kind={t.kind} message={t.message} />
          ))}
        </div>
      )}
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-md bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <BsLightningChargeFill className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-emerald-400 font-montserrat">Flux</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <Button variant="ghost" className="text-white hover:text-emerald-400">Dashboard</Button>
                <Button variant="ghost" className="text-white/70 hover:text-white">Portfolio</Button>
                <Button variant="ghost" className="text-white/70 hover:text-white">Strategies</Button>
                <Button variant="ghost" className="text-white/70 hover:text-white">Education</Button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input 
                  placeholder="Search stocks..." 
                  className="pl-10 w-64 glass-effect text-white placeholder:text-white/50 border-white/20"
                />
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:text-emerald-400">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-emerald-400">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-emerald-400">
                <UserIcon className="h-5 w-5" />
              </Button>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Crypto Chart */}
        <section className="fade-in-up">
          <h2 className="text-2xl font-bold text-white mb-4">Crypto Market</h2>
          <div className="flex items-center gap-3 mb-4">
            <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="w-40 glass-effect text-white border-white/20" />
            <select value={interval} onChange={(e) => setInterval(e.target.value)} className="rounded-md bg-transparent border border-white/20 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
              {['1m','5m','15m','1h','4h','1d'].map(i => <option key={i} value={i} className="bg-slate-800">{i}</option>)}
            </select>
          </div>
          <div className="glass-card border-0 p-4">
            {candles ? <CryptoChart candles={candles} /> : <div className="text-white/70">Loading chart…</div>}
          </div>
        </section>
        {/* Portfolio Overview */}
        <section className="fade-in-up">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Wallet className="mr-3 h-6 w-6 text-emerald-400" />
            Portfolio Overview
          </h2>
          {error && (
            <div className="text-sm text-red-400 mb-4">{error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolioData.map((item, index) => (
              <Card key={item.label} className={`glass-card border-0 hover:shadow-2xl transition-all duration-500 stagger-${index + 1}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className='mt-4'>
                      <p className="text-white/70 text-sm font-medium">{item.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
                    </div>
                    <div className={`flex items-center space-x-1 ${item.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">{item.change}</span>
                    </div>
                  </div>
                  <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.trend === 'up' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gradient-to-r from-red-500 to-pink-500'} animate-pulse`} style={{width: '70%'}}></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Watchlist */}
          <div className="lg:col-span-1">
            <Card className="glass-card border-0 fade-in-up stagger-2 relative z-50 overflow-visible">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-emerald-400" />
                  Market Watchlist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {watchlist.map((sym) => {
                  const t = tickers[sym]
                  const changeUp = (t?.priceChangePercent ?? 0) >= 0
                  return (
                    <div key={sym} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                      <div>
                        <p className="font-semibold text-white">{sym}</p>
                        <p className="text-sm text-white/70">{t ? `$${t.lastPrice.toFixed(2)}` : '—'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center space-x-1 ${changeUp ? 'text-emerald-400' : 'text-red-400'}`}>
                          {changeUp ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">{t ? `${t.priceChangePercent.toFixed(2)}%` : '—'}</span>
                        </div>
                        <Button
                          variant="outline"
                          className="border-white/20 ml-2 text-white/80 hover:text-red-400 hover:border-red-400/40"
                          onClick={() => {
                            setWatchlist(watchlist.filter((s) => s !== sym))
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
                <div className="mt-4">
                  <div className="flex gap-2">
                    <div className="relative z-50 flex-1">
                      <Input
                        value={watchlistInput}
                        onChange={(e) => setWatchlistInput(e.target.value)}
                        placeholder="Search or add (e.g., DOGE or DOGEUSDT)"
                        className="glass-effect text-white placeholder:text-white/50 border-white/20"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const q = watchlistInput.trim().toUpperCase()
                            const firstSuggestion = q
                              ? symbols.filter((s) => !watchlist.includes(s.symbol) && (s.symbol.includes(q) || s.baseAsset.includes(q)))[0]
                              : undefined
                            const next = firstSuggestion?.symbol || q
                            if (next && !watchlist.includes(next)) setWatchlist([...watchlist, next])
                            setWatchlistInput('')
                          }
                        }}
                      />
                      {(() => {
                        const q = watchlistInput.trim().toUpperCase()
                        if (!q) return null
                        const matches = symbols
                          .filter((s) => !watchlist.includes(s.symbol) && (s.symbol.includes(q) || s.baseAsset.includes(q)))
                          .slice(0, 8)
                        if (matches.length === 0) return null
                        return (
                          <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-white/10 bg-slate-900/95 backdrop-blur-md shadow-2xl max-h-64 overflow-auto scrollbar-none">
                            {matches.map((s) => (
                              <button
                                key={s.symbol}
                                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 flex items-center justify-between"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  if (!watchlist.includes(s.symbol)) setWatchlist([...watchlist, s.symbol])
                                  setWatchlistInput('')
                                }}
                              >
                                <span>{s.symbol}</span>
                                <span className="text-white/60 text-xs">{s.baseAsset}/{s.quoteAsset}</span>
                              </button>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                    <Button className="modern-button" onClick={() => {
                      const q = watchlistInput.trim().toUpperCase()
                      const firstSuggestion = q
                        ? symbols.filter((s) => !watchlist.includes(s.symbol) && (s.symbol.includes(q) || s.baseAsset.includes(q)))[0]
                        : undefined
                      const next = firstSuggestion?.symbol || q
                      if (next && !watchlist.includes(next)) setWatchlist([...watchlist, next])
                      setWatchlistInput('')
                    }}>
                      <Target className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Interface */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-0 fade-in-up stagger-3">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-emerald-400" />
                  Quick Trade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-white/70 mb-2 block">Symbol</label>
                      {watchlist.length > 0 ? (
                        <Select value={tradeSymbol} onChange={(e) => setTradeSymbol(e.target.value)}>
                          {watchlist.map((sym) => (
                            <option key={sym} value={sym} className="bg-slate-800 text-white">{sym}</option>
                          ))}
                        </Select>
                      ) : (
                        <div className="text-white/70">No symbols in watchlist</div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white/70 mb-2 block">Quantity</label>
                      <Input
                        type="number"
                        value={tradeQty}
                        onChange={(e) => setTradeQty(parseFloat(e.target.value) || 0)}
                        placeholder="100"
                        className="glass-effect text-white placeholder:text-white/50 border-white/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white/70 mb-2 block">Order Type</label>
                      <div className="flex space-x-2">
                        <Button variant="outline" className="flex-1 glass-effect text-white border-white/20 hover:bg-emerald-500/20">Market</Button>
                        <Button variant="outline" className="flex-1 glass-effect text-white border-white/20">Limit</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <h4 className="text-white font-medium mb-2">Order Preview</h4>
                      <div className="space-y-2 text-sm">
                        {(() => {
                          const price = tickers[tradeSymbol]?.lastPrice
                          const balance = serverBalance
                          const positionQty = (holdings[tradeSymbol] ?? holdings[tradeSymbol.toUpperCase()] ?? 0) as number
                          const maxBuyQty = price && balance !== null ? balance / price : null
                          return (
                            <>
                              <div className="flex justify-between text-white/70">
                                <span>Available Balance:</span>
                                <span className="text-white">{balance !== null ? `$${balance.toFixed(2)}` : '—'}</span>
                              </div>
                              <div className="flex justify-between text-white/70">
                                <span>Your Position:</span>
                                <span className="text-white">{positionQty} units</span>
                              </div>
                              {maxBuyQty !== null && (
                                <div className="flex justify-between text-white/70">
                                  <span>Max Buy Qty:</span>
                                  <span className="text-white">{maxBuyQty.toFixed(4)} units</span>
                                </div>
                              )}
                            </>
                          )
                        })()}
                        <div className="flex justify-between text-white/70">
                          <span>Symbol:</span>
                          <span className="text-white">{tradeSymbol}</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Quantity:</span>
                          <span className="text-white">{tradeQty} units</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Mark Price:</span>
                          <span className="text-white">{tickers[tradeSymbol] ? `$${tickers[tradeSymbol].lastPrice.toFixed(2)}` : '—'}</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Est. Cost:</span>
                          <span className="text-white">{tickers[tradeSymbol] ? `$${(tickers[tradeSymbol].lastPrice * tradeQty).toFixed(2)}` : '—'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={(() => {
                          const price = tickers[tradeSymbol]?.lastPrice
                          const balance = serverBalance
                          if (!tradeSymbol || tradeQty <= 0 || !price || !!tradeSubmitting) return true
                          if (balance !== null && price * tradeQty > balance) return true
                          return false
                        })()}
                        onClick={async () => {
                          if (!tradeSymbol || tradeQty <= 0) return
                          const price = tickers[tradeSymbol]?.lastPrice || 0
                          try {
                            setTradeSubmitting('BUY')
                            const res = await createTrade({ symbol: tradeSymbol, side: 'BUY', quantity: tradeQty, price })
                            setRecentTrades((prev) => {
                              const next = [res.data, ...(prev || [])]
                              return next.slice(0, 20)
                            })
                            // refresh portfolio
                            try {
                              const p = await getPortfolio()
                              setServerBalance(p.balance)
                              setHoldings(p.portfolio || {})
                              setAvgPrices((p as any).avgPrices || {})
                              setRealizedPnl((p as any).realizedPnl || 0)
                            } catch {}
                            pushToast('success', 'Buy order placed successfully.')
                          } catch (e: any) {
                            pushToast('error', e?.message || 'Failed to place buy order.')
                          } finally {
                            setTradeSubmitting(null)
                          }
                        }}
                      >
                        Buy
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={(() => {
                          const price = tickers[tradeSymbol]?.lastPrice
                          const positionQty = (holdings[tradeSymbol] ?? holdings[tradeSymbol.toUpperCase()] ?? 0) as number
                          if (!tradeSymbol || tradeQty <= 0 || !price || !!tradeSubmitting) return true
                          if (positionQty <= 0 || tradeQty > positionQty) return true
                          return false
                        })()}
                        onClick={async () => {
                          if (!tradeSymbol || tradeQty <= 0) return
                          const price = tickers[tradeSymbol]?.lastPrice || 0
                          try {
                            setTradeSubmitting('SELL')
                            const res = await createTrade({ symbol: tradeSymbol, side: 'SELL', quantity: tradeQty, price })
                            setRecentTrades((prev) => {
                              const next = [res.data, ...(prev || [])]
                              return next.slice(0, 20)
                            })
                            // refresh portfolio
                            try {
                              const p = await getPortfolio()
                              setServerBalance(p.balance)
                              setHoldings(p.portfolio || {})
                              setAvgPrices((p as any).avgPrices || {})
                              setRealizedPnl((p as any).realizedPnl || 0)
                            } catch {}
                            pushToast('success', 'Sell order placed successfully.')
                          } catch (e: any) {
                            pushToast('error', e?.message || 'Failed to place sell order.')
                          } finally {
                            setTradeSubmitting(null)
                          }
                        }}
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Trades & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Trades */}
          <Card className="glass-card border-0 fade-in-up stagger-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-emerald-400" />
                Recent Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTrades === null ? (
                <div className="text-white/70">Loading trades…</div>
              ) : recentTrades.length === 0 ? (
                <div className="text-white/70">No trade history yet.</div>
              ) : (
                <div className="space-y-3">
                  {recentTrades.map((trade) => (
                    <div key={trade._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <Badge variant={trade.side === 'BUY' ? 'default' : 'secondary'} className={trade.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
                          {trade.side}
                        </Badge>
                        <div>
                          <p className="font-semibold text-white">{trade.symbol}</p>
                          <p className="text-sm text-white/70">{trade.quantity} units @ ${trade.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/70">{new Date(trade.createdAt).toLocaleString()}</p>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-400/50">
                          {trade.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competition Leaderboard */}
          <Card className="glass-card border-0 fade-in-up stagger-5">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-emerald-400" />
                Competition Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboardTop === null ? (
                <div className="text-white/70">Loading leaderboard…</div>
              ) : (
                <div className="space-y-3">
                  {leaderboardTop.map((row, idx) => (
                    <div key={`${row.userId}-${idx}`} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-white/20 text-white">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{row.displayName || `User ${row.userId.slice(0, 6)}`}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${row.returnPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {row.returnPct >= 0 ? '+' : ''}{row.returnPct.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}

                  {leaderboardYou && (
                    <div className="mt-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-emerald-500 text-white">
                          {leaderboardYou.rank}
                        </div>
                        <div>
                          <p className="font-medium text-emerald-400">{leaderboardYou.displayName || 'You'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${leaderboardYou.returnPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {leaderboardYou.returnPct >= 0 ? '+' : ''}{leaderboardYou.returnPct.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Inline Toasts for this page
function ToastItem({ kind, message }: { kind: 'success'|'error'|'info'; message: string }) {
  const base = 'px-4 py-3 rounded-md shadow-lg text-white text-sm'
  const color = kind === 'success' ? 'bg-emerald-600/90' : kind === 'error' ? 'bg-red-600/90' : 'bg-slate-700/90'
  return <div className={`${base} ${color}`}>{message}</div>
}

function SignOutButton() {
  const { logout } = useAuth()
  return (
    <Button
      variant="outline"
      className="text-white border-white/20"
      onClick={() => logout()}
    >
      Sign out
    </Button>
  )
}
