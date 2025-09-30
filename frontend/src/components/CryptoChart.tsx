import { createChart, CandlestickSeries, type IChartApi } from 'lightweight-charts'
import { useEffect, useRef } from 'react'

export type Candle = { time: number; open: number; high: number; low: number; close: number }

export default function CryptoChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  // Lightweight Charts v5 uses addSeries with a series definition (e.g., CandlestickSeries)
  // Keep the ref loosely typed to avoid generic type friction.
  const seriesRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      height: 380,
      layout: { background: { color: 'transparent' }, textColor: '#e5e7eb' },
      grid: { vertLines: { color: 'rgba(255,255,255,0.08)' }, horzLines: { color: 'rgba(255,255,255,0.08)' } },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.16)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.16)' },
    })
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    })
    chartRef.current = chart
    seriesRef.current = series
    const ro = new ResizeObserver(() => chart.applyOptions({ width: containerRef.current!.clientWidth }))
    ro.observe(containerRef.current)
    return () => {
      ro.disconnect()
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!seriesRef.current) return
    seriesRef.current.setData(candles.map(c => ({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close })))
  }, [candles])

  return <div ref={containerRef} className="w-full" />
}
