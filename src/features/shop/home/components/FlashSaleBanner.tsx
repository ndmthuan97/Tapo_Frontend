/**
 * FlashSaleBanner — public countdown banner for active flash sales.
 *
 * react skill §4: empty state, §5: useCallback memoization
 * Design: vibrant orange-red gradient with countdown timer per item.
 */
import { useState, useEffect, useCallback } from 'react'
import { Zap, Clock, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { flashSaleApi, type FlashSaleDto } from '@/lib/http/flash-sale.api'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(endTime: string) {
  const calcSecs = () =>
    Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000))

  const [secs, setSecs] = useState(calcSecs)

  useEffect(() => {
    if (secs <= 0) return
    const id = setInterval(() => setSecs(calcSecs), 1000)
    return () => clearInterval(id)
  }, [endTime]) // eslint-disable-line react-hooks/exhaustive-deps

  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return { h, m, s, expired: secs <= 0 }
}

// ── Segment display ───────────────────────────────────────────────────────────
function TimeSegment({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="rounded-md bg-black/30 px-2 py-1 text-xl font-bold tabular-nums text-white leading-none min-w-[40px] text-center">
        {value}
      </span>
      <span className="text-[10px] text-white/70 mt-0.5">{label}</span>
    </div>
  )
}

// ── Countdown display ─────────────────────────────────────────────────────────
function Countdown({ endTime }: { endTime: string }) {
  const { h, m, s, expired } = useCountdown(endTime)
  if (expired) return <span className="text-sm text-white/70 italic">Đã kết thúc</span>
  return (
    <div className="flex items-end gap-1">
      <TimeSegment value={h} label="giờ" />
      <span className="text-white font-bold text-xl pb-4 leading-none">:</span>
      <TimeSegment value={m} label="phút" />
      <span className="text-white font-bold text-xl pb-4 leading-none">:</span>
      <TimeSegment value={s} label="giây" />
    </div>
  )
}

// ── Single Flash Sale Card ────────────────────────────────────────────────────
function FlashCard({ sale, onClick }: { sale: FlashSaleDto; onClick: () => void }) {
  const stockPercent = Math.min(100, Math.round((sale.soldCount / sale.stockLimit) * 100))

  return (
    <div
      className="group flex flex-col md:flex-row gap-4 rounded-2xl overflow-hidden bg-white/10 backdrop-blur cursor-pointer hover:bg-white/20 transition-all duration-200"
      onClick={onClick}
      role="link"
    >
      {/* Thumbnail */}
      <div className="relative h-40 md:h-auto md:w-40 shrink-0 overflow-hidden">
        {sale.thumbnailUrl ? (
          <img
            src={sale.thumbnailUrl}
            alt={sale.productName}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full bg-white/20 flex items-center justify-center">
            <Zap size={32} className="text-white/40" />
          </div>
        )}
        {/* Discount badge */}
        <div className="absolute top-2 right-2 rounded-full bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 shadow">
          -{sale.discountPercent}%
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <p className="font-semibold text-white line-clamp-2 text-sm md:text-base">{sale.productName}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-yellow-300">
              {sale.salePrice.toLocaleString('vi-VN')}₫
            </span>
            <span className="text-sm text-white/60 line-through">
              {sale.originalPrice.toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>

        {/* Stock bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-white/70 mb-1">
            <span>Đã bán: {sale.soldCount}</span>
            <span>Còn: {sale.remaining}</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
              style={{ width: `${stockPercent}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <button
          id={`flash-sale-btn-${sale.id}`}
          onClick={e => { e.stopPropagation(); onClick() }}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-yellow-400 text-gray-900 font-semibold py-2 text-sm hover:bg-yellow-300 transition-colors"
        >
          <ShoppingCart size={15} />
          Mua ngay
        </button>
      </div>
    </div>
  )
}

// ── Main Banner ───────────────────────────────────────────────────────────────
export function FlashSaleBanner() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [sales, setSales]       = useState<FlashSaleDto[]>([])
  const [loading, setLoading]   = useState(true)
  const [current, setCurrent]   = useState(0)

  const loadSales = useCallback(async () => {
    try {
      const data = await flashSaleApi.getActiveSales()
      setSales(data)
    } catch {
      // Silent fail — banner is non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSales() }, [loadSales])

  // react skill §5: don't render component at all if no data (avoids empty section)
  if (loading || sales.length === 0) return null

  const activeSale = sales[current]
  const canPrev = current > 0
  const canNext = current < sales.length - 1

  return (
    <section
      aria-label="Flash Sale"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 p-6 shadow-xl"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 animate-pulse">
            <Zap size={20} className="text-yellow-300" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">⚡ FLASH SALE</h2>
            <p className="text-xs text-white/70">Giảm giá sốc — số lượng có hạn!</p>
          </div>
        </div>

        {/* Countdown for current sale */}
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-white/70 shrink-0" />
          <Countdown endTime={activeSale.endTime} />
        </div>
      </div>

      {/* Card */}
      <FlashCard
        sale={activeSale}
        onClick={() => navigate(`/products/${activeSale.productSlug}`)}
      />

      {/* Pagination dots + arrows */}
      {sales.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={!canPrev}
            className="rounded-full p-1 bg-white/20 text-white disabled:opacity-30 hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-1.5">
            {sales.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-200 ${i === current ? 'w-5 bg-white' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent(c => Math.min(sales.length - 1, c + 1))}
            disabled={!canNext}
            className="rounded-full p-1 bg-white/20 text-white disabled:opacity-30 hover:bg-white/30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  )
}
