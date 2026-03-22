import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthContext } from '@/lib/context/auth-context'
import { UserRole } from '@/lib/types/user/user.types'

function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== UserRole.ADMIN) return <Navigate to="/" replace />
  return <>{children}</>
}

export { AdminRoute }
