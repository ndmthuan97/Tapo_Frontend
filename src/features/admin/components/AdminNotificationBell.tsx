/**
 * AdminNotificationBell — realtime notification bell for admin layout.
 *
 * react skill §1: single responsibility — displays bell + dropdown only.
 * react skill §4: empty state provided for "no notifications" case.
 * react skill §5: rendering-hoist-jsx — EMPTY_STATE hoisted outside component.
 */
import { useState, useRef, useEffect } from 'react'
import { Bell, WifiOff, X, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useAdminNotifications, TYPE_CONFIG, type AdminNotification } from '../hooks/useAdminNotifications'

// ── Static JSX (react skill §5: rendering-hoist-jsx) ────────────────────────────

function EmptyState() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Bell size={28} className="text-gray-200 dark:text-white/10 mb-2" />
      <p className="text-sm text-gray-400">{t('notification.empty')}</p>
    </div>
  )
}

// ── Notification Item ──────────────────────────────────────────────────────────

function NotificationItem({ n }: { n: AdminNotification }) {
  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.NEW_CONTACT_MESSAGE
  const Icon = cfg.icon
  const time = new Date(n.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
      <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10', cfg.color)}>
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{n.title}</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">{n.message}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function AdminNotificationBell() {
  const { t } = useTranslation()
  const { notifications, unreadCount, isConnected, clearUnread, clearHistory } = useAdminNotifications()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function h(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  function handleOpen() {
    setOpen(o => !o)
    if (!open) clearUnread() // mark read when opened
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        title={t('notification.title')}
      >
        <Bell size={18} />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {/* Disconnected indicator */}
        {!isConnected && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-gray-400">
            <WifiOff size={7} className="text-white" />
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#21232d] shadow-2xl animate-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-orange-500" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">{t('notification.title')}</span>
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 transition-colors"
                >
                  <Check size={10} /> {t('notification.clearAll')}
                </button>
              )}
              <button onClick={() => setOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Connection status */}
          {!isConnected && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 text-[11px] text-amber-600 dark:text-amber-400">
              <WifiOff size={11} /> {t('notification.reconnecting')}
            </div>
          )}

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
            {notifications.length === 0
              ? <EmptyState />
              : notifications.map(n => <NotificationItem key={n.id} n={n} />)
            }
          </div>
        </div>
      )}
    </div>
  )
}
