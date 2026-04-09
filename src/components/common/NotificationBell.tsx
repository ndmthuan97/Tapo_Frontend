/**
 * NotificationBell — Dropdown notification center for shop users.
 *
 * Shows bell icon + unread badge on Header (chỉ khi logged in).
 * Click → dropdown panel với max 10 notifications gần nhất.
 *
 * UX: click outside closes panel (react skill §2: useEffect cleanup)
 * Performance: useRef cho panel (react skill §5: advanced-event-handler-refs)
 */
import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, BellRing, Package, CheckCheck, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useUserNotifications,
  USER_NOTIFICATION_CONFIG,
  type UserNotification,
} from '@/features/shop/user/hooks/use-user-notifications'

// ── Notification item ─────────────────────────────────────────────────────────

function NotificationItem({ notification }: { notification: UserNotification }) {
  const cfg = USER_NOTIFICATION_CONFIG[notification.type]
  const Icon = cfg?.icon ?? Package

  // Format time
  const timeAgo = (() => {
    const diff = Date.now() - new Date(notification.timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'Vừa xong'
    if (mins < 60) return `${mins} phút trước`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `${hrs} giờ trước`
    return `${Math.floor(hrs / 24)} ngày trước`
  })()

  return (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/5',
      !notification.read && 'bg-orange-50/60 dark:bg-orange-500/5',
    )}>
      <div className={cn(
        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        !notification.read
          ? 'bg-orange-100 dark:bg-orange-500/20'
          : 'bg-gray-100 dark:bg-white/10',
      )}>
        <Icon size={15} className={cfg?.color ?? 'text-orange-500'} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {notification.message}
        </p>
        <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">{timeAgo}</p>
      </div>
      {!notification.read && (
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
      )}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

const EMPTY_BELL = (
  <div className="flex flex-col items-center gap-3 py-10 text-center">
    <Bell size={32} className="text-gray-300 dark:text-gray-600" />
    <p className="text-sm text-gray-400 dark:text-gray-500">Không có thông báo</p>
  </div>
)

// ── NotificationBell ──────────────────────────────────────────────────────────

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAllRead } = useUserNotifications()

  const preview = notifications.slice(0, 10)

  // Close on outside click (react skill §2: useEffect cleanup)
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  function handleOpen() {
    setOpen(prev => !prev)
    if (!open && unreadCount > 0) {
      // Mark all read khi mở panel
      markAllRead()
    }
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        id="notification-bell"
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
        onClick={handleOpen}
        className={cn(
          'relative rounded-full p-2 text-gray-500 dark:text-gray-400 transition-colors',
          open
            ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500'
            : 'hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white',
        )}
      >
        {unreadCount > 0
          ? <BellRing size={20} className="animate-[wiggle_0.5s_ease-in-out]" />
          : <Bell size={20} />
        }
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Thông báo"
          className={cn(
            'absolute right-0 top-full mt-2 w-80 rounded-2xl border border-gray-100 dark:border-white/10',
            'bg-white dark:bg-[#21232d] shadow-xl shadow-black/10 dark:shadow-black/30',
            'z-50 overflow-hidden',
            'animate-in fade-in-0 zoom-in-95 duration-150',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-orange-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Thông báo
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-orange-500 transition-colors"
              >
                <CheckCheck size={12} />
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
            {preview.length === 0
              ? EMPTY_BELL
              : preview.map(n => <NotificationItem key={n.id} notification={n} />)
            }
          </div>

          {/* Footer link */}
          <div className="border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#1a1c23]">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
            >
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export { NotificationBell }
