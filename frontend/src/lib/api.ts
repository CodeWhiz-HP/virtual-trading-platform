import { getFirebase } from './firebase'

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000'

async function getIdToken(): Promise<string> {
  const { auth } = getFirebase()
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  return user.getIdToken()
}

async function apiFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getIdToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export type PortfolioResponse = {
  _id?: string
  userId: string
  balance: number
  portfolio: Record<string, number>
  avgPrices?: Record<string, number>
  realizedPnl?: number
}

export function getPortfolio() {
  return apiFetch<PortfolioResponse>('/api/portfolio')
}

export function savePortfolio(payload: { balance: number; portfolio: Record<string, number> }) {
  return apiFetch<{ message: string; data: PortfolioResponse }>('/api/portfolio', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export type Ticker = {
  symbol: string
  lastPrice: number
  priceChangePercent: number
  highPrice: number
  lowPrice: number
  volume: number
}

export async function getTickers(symbols: string[]): Promise<Ticker[]> {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000'
  const qs = new URLSearchParams({ symbols: symbols.join(',') })
  const res = await fetch(`${base}/api/market/tickers?${qs}`)
  if (!res.ok) throw new Error(`Failed to fetch tickers: ${res.status}`)
  const json = await res.json()
  return json.data as Ticker[]
}

export type Trade = {
  _id: string
  userId: string
  symbol: string
  side: 'BUY' | 'SELL'
  quantity: number
  price: number
  status: 'completed' | 'pending' | 'cancelled'
  createdAt: string
  updatedAt: string
  realizedProfit?: number
}

export function getTrades(limit = 20) {
  return apiFetch<{ data: Trade[] }>(`/api/trades?limit=${limit}`)
}

export function createTrade(payload: { symbol: string; side: 'BUY'|'SELL'; quantity: number; price?: number; status?: 'completed'|'pending'|'cancelled' }) {
  return apiFetch<{ message: string; data: Trade }>(`/api/trades`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export type MarketSymbol = { symbol: string; baseAsset: string; quoteAsset: string }

export async function getSymbols(quote = 'USDT'): Promise<MarketSymbol[]> {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000'
  const qs = new URLSearchParams({ quote })
  const res = await fetch(`${base}/api/market/symbols?${qs}`)
  if (!res.ok) throw new Error(`Failed to fetch symbols: ${res.status}`)
  const json = await res.json()
  return json.data as MarketSymbol[]
}

export type LeaderboardRow = { userId: string; equity: number; returnPct: number; rank?: number; displayName?: string }
export async function getLeaderboard(limit = 4): Promise<{ top: LeaderboardRow[]; you: LeaderboardRow | null }> {
  const token = await getIdToken()
  const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000'
  const res = await fetch(`${base}/api/leaderboard?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Failed to fetch leaderboard: ${res.status}`)
  return res.json()
}

// User Profile APIs
export type UserProfile = { _id?: string; userId: string; displayName?: string; photoURL?: string }
export async function getProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/profile')
}
export async function saveProfile(partial: { displayName?: string; photoURL?: string }) {
  return apiFetch<{ message: string; data: UserProfile }>('/api/profile', {
    method: 'POST',
    body: JSON.stringify(partial),
  })
}
