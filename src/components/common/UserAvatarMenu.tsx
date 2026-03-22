import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuthContext, DEFAULT_AVATAR } from '@/lib/context/auth-context'
import { cn } from '@/lib/utils'

function UserAvatarMenu() {
  const { user, clearUser } = useAuthContext()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  function handleLogout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    clearUser()
    toast.info(t('toast.logoutSuccess'), { description: t('toast.logoutSuccessDesc') })
    navigate('/login')
  }

  const avatarSrc = user.avatarUrl || DEFAULT_AVATAR

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-gray-100"
        aria-label="User menu"
        aria-expanded={open}
      >
        <img
          src={avatarSrc}
          alt={user.fullName}
          className="h-8 w-8 rounded-full object-cover ring-2 ring-orange-400"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR
          }}
        />
        <ChevronDown
          size={14}
          className={cn('text-gray-500 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-100 bg-white py-1 shadow-xl shadow-gray-200/60 z-50">
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
            <img src={avatarSrc} alt={user.fullName} className="h-10 w-10 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{user.fullName}</p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => { setOpen(false); navigate('/profile') }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
          >
            <User size={16} />
            {t('userMenu.viewProfile')}
          </button>

          <div className="my-1 border-t border-gray-100" />

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut size={16} />
            {t('userMenu.logout')}
          </button>
        </div>
      )}
    </div>
  )
}

export { UserAvatarMenu }
