import { type ElementType } from 'react'
import { cn } from '@/lib/utils'

// ── StatCard ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: ElementType
  label: string
  value: number | string
  color?: string
}

export function StatCard({ icon: Icon, label, value, color = 'bg-orange-500' }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 shadow-sm transition-colors">
      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', color)}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

// ── AdminSearchInput ───────────────────────────────────────────────────────────
import { Search } from 'lucide-react'

interface AdminSearchInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export function AdminSearchInput({ value, onChange, placeholder, className }: AdminSearchInputProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-52 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 pl-8 pr-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/30 transition"
      />
    </div>
  )
}

// ── AdminFilterSelect ─────────────────────────────────────────────────────────
interface Option {
  value: string
  label: string
}

interface AdminFilterSelectProps {
  value: string
  onChange: (v: string) => void
  options: Option[]
  className?: string
}

export function AdminFilterSelect({ value, onChange, options, className }: AdminFilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm focus:border-orange-400 dark:focus:border-orange-500 focus:outline-none transition-colors cursor-pointer',
        className,
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// ── AdminTablePagination ──────────────────────────────────────────────────────
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminTablePaginationProps {
  page: number        // 1-indexed for display
  totalPages: number
  onPageChange: (p: number) => void
}

export function AdminTablePagination({ page, totalPages, onPageChange }: AdminTablePaginationProps) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 px-5 py-3.5 transition-colors">
      <span className="text-xs text-gray-400">
        Trang {page} / {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 transition"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition',
              p === page
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5',
            )}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 transition"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
