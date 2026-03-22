import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/context/auth-context'

// ── Shop (public / customer) ────────────────────────────────────────────────
import { HomePage } from '@/features/home/pages/HomePage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ProfilePage } from '@/features/user/pages/ProfilePage'
import { AddressesPage } from '@/features/user/pages/AddressesPage'

// ── Admin panel ──────────────────────────────────────────────────────────────
import { AdminLayout } from '@/features/admin/components/AdminLayout'
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage'

// ── Route guards ─────────────────────────────────────────────────────────────
import { PrivateRoute } from '@/components/guards/PrivateRoute'
import { AdminRoute } from '@/components/guards/AdminRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton duration={4000} />
        <Routes>
          {/* ── Public / Shop ───────────────────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Authenticated customer ──────────────────────────────── */}
          <Route
            path="/profile"
            element={<PrivateRoute><ProfilePage /></PrivateRoute>}
          />
          <Route
            path="/profile/addresses"
            element={<PrivateRoute><AddressesPage /></PrivateRoute>}
          />

          {/* ── Admin panel (AdminRoute wraps each page in AdminLayout) */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminUsersPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
