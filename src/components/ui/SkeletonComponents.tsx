/**
 * SkeletonComponents — react skill §4: use skeletons instead of spinners for structured content.
 *
 * All components use `animate-pulse` CSS animation (Tailwind built-in).
 * Design tokens match the shop's existing card/table patterns.
 *
 * Exports:
 * - ProductCardSkeleton   — shop product grid card
 * - ProductDetailSkeleton — product detail 2-column layout
 * - TableRowSkeleton      — admin table rows
 * - DashboardStatSkeleton — admin stat cards (4-up grid)
 */

// ── Shared pulse base ───────────────────────────────────────────────────────────

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-100 dark:bg-white/8 ${className ?? ''}`} />
}

// ── Product Card Skeleton ────────────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] overflow-hidden">
      {/* Image block */}
      <Pulse className="h-52 rounded-none" />
      <div className="p-4 space-y-2.5">
        <Pulse className="h-3 w-20" />
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-1">
          <Pulse className="h-5 w-24" />
          <Pulse className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Grid of n ProductCardSkeletons — drop-in replacement for a loading product list.
 * Usage: <ProductCardSkeletonGrid count={12} />
 */
export function ProductCardSkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ── Product Detail Skeleton ─────────────────────────────────────────────────────

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: image */}
        <div className="space-y-3">
          <Pulse className="aspect-square rounded-2xl" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => <Pulse key={i} className="aspect-square rounded-lg" />)}
          </div>
        </div>
        {/* Right: info */}
        <div className="space-y-4">
          <Pulse className="h-3 w-24" />
          <Pulse className="h-8 w-3/4" />
          <Pulse className="h-6 w-32" />
          <div className="space-y-2 pt-2">
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-5/6" />
          </div>
          <div className="pt-4 space-y-3">
            <Pulse className="h-12 w-full rounded-xl" />
            <Pulse className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Table Row Skeleton ──────────────────────────────────────────────────────────

interface TableRowSkeletonProps {
  rows?: number
  cols?: number
}

export function TableRowSkeleton({ rows = 5, cols = 6 }: TableRowSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIdx) => (
        <tr key={rowIdx} className="border-b border-gray-100 dark:border-white/5">
          {Array.from({ length: cols }, (__, colIdx) => (
            <td key={colIdx} className="px-4 py-3">
              <Pulse className={`h-4 ${colIdx === 0 ? 'w-8' : colIdx === cols - 1 ? 'w-16' : 'w-full'}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ── Dashboard Stat Skeleton ─────────────────────────────────────────────────────

export function DashboardStatSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Pulse className="h-4 w-24" />
            <Pulse className="h-9 w-9 rounded-xl" />
          </div>
          <Pulse className="h-8 w-32" />
          <Pulse className="h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

// ── Order Card Skeleton ──────────────────────────────────────────────────────────

/**
 * Skeleton for a single order card in OrdersPage.
 * react skill §4: Use skeleton (known shape) instead of spinner for list items.
 */
export function OrderCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Pulse className="h-3 w-28" />
          <Pulse className="h-4 w-20" />
        </div>
        <Pulse className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-3">
        {[...Array(3)].map((_, i) => (
          <Pulse key={i} className="h-14 w-14 rounded-xl flex-shrink-0" />
        ))}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-gray-50 dark:border-white/5">
        <Pulse className="h-5 w-32" />
        <Pulse className="h-8 w-28 rounded-xl" />
      </div>
    </div>
  )
}

/**
 * Grid of n OrderCardSkeletons — drop-in for OrdersPage loading state.
 */
export function OrderCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => <OrderCardSkeleton key={i} />)}
    </div>
  )
}

// ── Wishlist Card Skeleton ──────────────────────────────────────────────────────

/**
 * Skeleton for a wishlist product card.
 */
export function WishlistCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] overflow-hidden">
      <Pulse className="h-48 rounded-none" />
      <div className="p-4 space-y-2.5">
        <Pulse className="h-3 w-20" />
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-2">
          <Pulse className="h-5 w-24" />
          <div className="flex gap-2">
            <Pulse className="h-8 w-8 rounded-full" />
            <Pulse className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function WishlistCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => <WishlistCardSkeleton key={i} />)}
    </div>
  )
}

// ── Order Detail Skeleton ────────────────────────────────────────────────────────

/**
 * Skeleton for OrderDetailPage — shows the layout of the order detail view.
 */
export function OrderDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Pulse className="h-8 w-8 rounded-xl" />
        <div className="space-y-1.5">
          <Pulse className="h-5 w-48" />
          <Pulse className="h-3 w-32" />
        </div>
      </div>
      {/* Status timeline */}
      <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-6">
        <Pulse className="h-4 w-32 mb-5" />
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-1 space-y-2">
              <Pulse className="h-8 w-8 rounded-full mx-auto" />
              <Pulse className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
      {/* Items */}
      <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-6 space-y-4">
        <Pulse className="h-4 w-28 mb-2" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Pulse className="h-16 w-16 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-4 w-full" />
              <Pulse className="h-3 w-24" />
            </div>
            <Pulse className="h-4 w-20" />
          </div>
        ))}
      </div>
      {/* Summary */}
      <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <Pulse className="h-4 w-28" />
            <Pulse className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

