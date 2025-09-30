import Redis from 'ioredis'

let client: Redis | null = null

export function getRedis(): Redis {
  if (client) return client
  const url = process.env.REDIS_URL
  if (url) {
    client = new Redis(url, { maxRetriesPerRequest: 3, enableReadyCheck: true })
  } else {
    const host = process.env.REDIS_HOST || '127.0.0.1'
    const port = parseInt(process.env.REDIS_PORT || '6379', 10)
    const password = process.env.REDIS_PASSWORD || undefined
    client = new Redis({ host, port, password, maxRetriesPerRequest: 3, enableReadyCheck: true })
  }
  client.on('connect', () => console.log('Redis connected'))
  client.on('error', (e) => console.error('Redis error:', e?.message || e))
  return client
}

export async function cacheWrap<T>(key: string, ttlSec: number, fetcher: () => Promise<T>): Promise<T> {
  try {
    const redis = getRedis()
    const cached = await redis.get(key)
    if (cached) return JSON.parse(cached) as T
    const fresh = await fetcher()
    await redis.set(key, JSON.stringify(fresh), 'EX', ttlSec)
    return fresh
  } catch {
    // If Redis unavailable, just compute and return fresh
    return fetcher()
  }
}
