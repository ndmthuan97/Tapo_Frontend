import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { AuthResponse } from '@/lib/types/auth.types'

const DEFAULT_AVATAR = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcZsL6PVn0SNiabAKz7js0QknS2ilJam19QQ&s'

interface AuthUser {
  id: string
  fullName: string
  email: string
  avatarUrl: string
  role: string
}

interface AuthContextValue {
  user: AuthUser | null
  setUserFromAuthResponse: (auth: AuthResponse) => void
  clearUser: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const setUserFromAuthResponse = useCallback((auth: AuthResponse) => {
    setUser({
      id: auth.user.id,
      fullName: auth.user.fullName,
      email: auth.user.email,
      avatarUrl: auth.user.avatarUrl ?? DEFAULT_AVATAR,
      role: auth.user.role,
    })
  }, [])

  const clearUser = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUserFromAuthResponse, clearUser }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>')
  return ctx
}

export { AuthProvider, useAuthContext, DEFAULT_AVATAR }
