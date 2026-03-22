import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { AuthResponse } from '@/lib/types/auth.types'

export const DEFAULT_AVATAR =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcZsL6PVn0SNiabAKz7js0QknS2ilJam19QQ&s'

const USER_STORAGE_KEY = 'auth_user'

export interface AuthUser {
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

/** Read previously saved user from localStorage (null if missing or malformed). */
function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function AuthProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage so page-reloads (and direct navigation) work
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Only hydrate if a token actually exists — avoids stale data after manual logout
    const hasToken = !!localStorage.getItem('accessToken')
    return hasToken ? readStoredUser() : null
  })

  const setUserFromAuthResponse = useCallback((auth: AuthResponse) => {
    const authUser: AuthUser = {
      id: auth.user.id,
      fullName: auth.user.fullName,
      email: auth.user.email,
      avatarUrl: auth.user.avatarUrl ?? DEFAULT_AVATAR,
      role: auth.user.role,
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser))
    setUser(authUser)
  }, [])

  const clearUser = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY)
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

export { AuthProvider, useAuthContext }
