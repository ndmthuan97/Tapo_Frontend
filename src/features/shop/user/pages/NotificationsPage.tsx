import { useMemo } from 'react'
import { Bell, CheckCheck, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useUserNotifications,
  USER_NOTIFICATION_CONFIG,
  type UserNotification,
} from '@/features/shop/user/hooks/use-user-notifications'

function NotificationItemRow({ notification }: { notification: UserNotification }) {
  const cfg = USER_NOTIFICATION_CONFIG[notification.type]
  const Icon = cfg?.icon ?? Package

  const date = new Date(notification.timestamp)
  const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={cn(
      'flex items-start gap-4 rounded-2xl border p-4 transition-all',
      !notification.read
        ? 'border-orange-200 bg-orange-50/50 dark:border-orange-500/20 dark:bg-orange-500/5'
        : 'border-gray-100 bg-white hover:border-gray-200 dark:border-white/5 dark:bg-[#21232d] dark:hover:border-white/10',
    )}>
      <div className={cn(
        'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
        !notification.read
          ? 'bg-orange-100 dark:bg-orange-500/20'
          : 'bg-gray-100 dark:bg-white/10',
      )}>
        <Icon size={18} className={cfg?.color ?? 'text-orange-500'} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            'text-sm font-semibold leading-snug text-gray-900 dark:text-white',
            !notification.read && 'text-orange-900 dark:text-orange-50',
          )}>
            {notification.title}
          </h4>
          <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
            {timeStr}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {notification.message}
        </p>
      </div>

      {!notification.read && (
        <div className="flex h-10 items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
        </div>
      )}
    </div>
  )
}

function NotificationsPage() {
  const { notifications, unreadCount, markAllRead } = useUserNotifications()

  // Group notifications by relative day
  const grouped = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const groups: Record<string, UserNotification[]> = {
      'Hôm nay': [],
      'Hôm qua': [],
      'Cũ hơn': [],
    }

    notifications.forEach(n => {
      const d = new Date(n.timestamp)
      d.setHours(0, 0, 0, 0)
      
      if (d.getTime() === today.getTime()) {
        groups['Hôm nay'].push(n)
      } else if (d.getTime() === yesterday.getTime()) {
        groups['Hôm qua'].push(n)
      } else {
        groups['Cũ hơn'].push(n)
      }
    })

    return groups
  }, [notifications])

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-500/10">
            <Bell size={24} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thông báo</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Bạn có <span className="font-semibold text-orange-500">{unreadCount}</span> thông báo chưa đọc
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-orange-300 hover:text-orange-500 transition-all shadow-sm"
          >
            <CheckCheck size={16} />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 dark:border-white/10 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5">
            <Bell size={28} className="text-gray-300 dark:text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Không có thông báo nào</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Khi có cập nhật về đơn hàng hoặc khuyến mãi, thông báo sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([label, items]) => {
            if (items.length === 0) return null
            return (
              <div key={label}>
                <h3 className="mb-4 text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</h3>
                <div className="space-y-3">
                  {items.map(n => (
                    <NotificationItemRow key={n.id} notification={n} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { NotificationsPage }
