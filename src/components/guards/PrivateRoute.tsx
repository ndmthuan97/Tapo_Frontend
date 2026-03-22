import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthContext } from '@/lib/context/auth-context'

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export { PrivateRoute }
