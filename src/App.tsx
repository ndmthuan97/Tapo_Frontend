import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/context/auth-context'

// ── Shop ────────────────────────────────────────────────────────────────────
import { HomePage }      from '@/features/shop/home/pages/HomePage'
import { LoginPage }     from '@/features/shop/auth/pages/LoginPage'
import { RegisterPage }  from '@/features/shop/auth/pages/RegisterPage'
import { ProfilePage }   from '@/features/shop/user/pages/ProfilePage'
import { AddressesPage } from '@/features/shop/user/pages/AddressesPage'

// ── Admin ───────────────────────────────────────────────────────────────────
import { AdminLayout }    from '@/features/admin/components/AdminLayout'
import { DashboardPage }  from '@/features/admin/pages/DashboardPage'
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage'
import { AdminProfilePage } from '@/features/admin/pages/AdminProfilePage'

// ── Route guards ─────────────────────────────────────────────────────────────
import { PrivateRoute } from '@/components/guards/PrivateRoute'
import { AdminRoute }   from '@/components/guards/AdminRoute'

/** Wrap a page with the shared AdminRoute + AdminLayout */
function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton duration={4000} />
        <Routes>
          {/* ── Public / Shop ───────────────────────────────────────── */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Authenticated customer ──────────────────────────────── */}
          <Route path="/profile"          element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/profile/addresses" element={<PrivateRoute><AddressesPage /></PrivateRoute>} />

          {/* ── Admin panel ──────────────────────────────────────────── */}
          <Route path="/admin"         element={<AdminPage><DashboardPage /></AdminPage>} />
          <Route path="/admin/users"   element={<AdminPage><AdminUsersPage /></AdminPage>} />
          <Route path="/admin/profile" element={<AdminPage><AdminProfilePage /></AdminPage>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
