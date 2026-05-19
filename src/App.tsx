import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/context/auth-context'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// ── Shop ────────────────────────────────────────────────────────────────────
import { HomePage }           from '@/features/shop/home/pages/HomePage'
import { ProductsPage }        from '@/features/shop/home/pages/ProductsPage'
import { ProductDetailPage }   from '@/features/shop/home/pages/ProductDetailPage'
import { NotFoundPage }        from '@/features/shop/home/pages/NotFoundPage'
import { WishlistPage }        from '@/features/shop/home/pages/WishlistPage'
import { CartPage }            from '@/features/shop/home/pages/CartPage'
import { SearchPage }          from '@/features/shop/home/pages/SearchPage'
import { CategoryPage }        from '@/features/shop/home/pages/CategoryPage'
import { CheckoutPage }        from '@/features/shop/home/pages/CheckoutPage'
import { OrdersPage }          from '@/features/shop/home/pages/OrdersPage'
import { OrderDetailPage }     from '@/features/shop/home/pages/OrderDetailPage'
import { OrderReturnPage }     from '@/features/shop/home/pages/OrderReturnPage'
import { MyReturnsPage }       from '@/features/shop/home/pages/MyReturnsPage'
import { ComparePage }         from '@/features/shop/home/pages/ComparePage'
import { LoginPage }           from '@/features/shop/auth/pages/LoginPage'
import { RegisterPage }        from '@/features/shop/auth/pages/RegisterPage'
import { ForgotPasswordPage }  from '@/features/shop/auth/pages/ForgotPasswordPage'
import { VerifyEmailPage }     from '@/features/shop/auth/pages/VerifyEmailPage'
import { VerifyEmailNoticePage } from '@/features/shop/auth/pages/VerifyEmailNoticePage'
import { ResetPasswordPage }   from '@/features/shop/auth/pages/ResetPasswordPage'
import { OAuthCallbackPage }   from '@/features/shop/auth/pages/OAuthCallbackPage'
import { ProfilePage }         from '@/features/shop/user/pages/ProfilePage'
import { AddressesPage }       from '@/features/shop/user/pages/AddressesPage'
import { NotificationsPage }   from '@/features/shop/user/pages/NotificationsPage'
import { BlogPage }            from '@/features/shop/home/pages/BlogPage'
import { BlogDetailPage }      from '@/features/shop/home/pages/BlogDetailPage'
import { ContactPage }         from '@/features/shop/home/pages/ContactPage'
import { VouchersPage }        from '@/features/shop/home/pages/VouchersPage'

import { CustomerChatWidget } from '@/features/shop/user/components/CustomerChatWidget'

// ── Admin (lazy-loaded — code splitting cho admin bundle) ──────────────────────────────
const AdminLayout         = lazy(() => import('@/features/admin/components/AdminLayout').then(m => ({ default: m.AdminLayout })))
const DashboardPage       = lazy(() => import('@/features/admin/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AdminUsersPage      = lazy(() => import('@/features/admin/pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })))
const AdminProfilePage    = lazy(() => import('@/features/admin/pages/AdminProfilePage').then(m => ({ default: m.AdminProfilePage })))
const AdminProductsPage   = lazy(() => import('@/features/admin/pages/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })))
const AdminCategoriesPage = lazy(() => import('@/features/admin/pages/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })))
const AdminBrandsPage     = lazy(() => import('@/features/admin/pages/AdminBrandsPage').then(m => ({ default: m.AdminBrandsPage })))
const AdminOrdersPage     = lazy(() => import('@/features/admin/pages/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })))
const AdminMessagesPage   = lazy(() => import('@/features/admin/pages/AdminMessagesPage').then(m => ({ default: m.AdminMessagesPage })))
const AdminReviewsPage    = lazy(() => import('@/features/admin/pages/AdminReviewsPage').then(m => ({ default: m.AdminReviewsPage })))
const AdminVouchersPage   = lazy(() => import('@/features/admin/pages/AdminVouchersPage').then(m => ({ default: m.AdminVouchersPage })))
const AdminReturnsPage    = lazy(() => import('@/features/admin/pages/AdminReturnsPage').then(m => ({ default: m.AdminReturnsPage })))
const AdminBlogPage       = lazy(() => import('@/features/admin/pages/AdminBlogPage').then(m => ({ default: m.AdminBlogPage })))
const AdminBannersPage    = lazy(() => import('@/features/admin/pages/AdminBannersPage').then(m => ({ default: m.AdminBannersPage })))
const AdminChatPage       = lazy(() => import('@/features/admin/pages/AdminChatPage').then(m => ({ default: m.AdminChatPage })))
const AdminFlashSalesPage = lazy(() => import('@/features/admin/pages/AdminFlashSalesPage').then(m => ({ default: m.AdminFlashSalesPage })))
const AdminInventoryPage  = lazy(() => import('@/features/admin/pages/AdminInventoryPage').then(m => ({ default: m.AdminInventoryPage })))

// ── Route guards ─────────────────────────────────────────────────────────────
import { PrivateRoute } from '@/components/guards/PrivateRoute'
import { AdminRoute }   from '@/components/guards/AdminRoute'

/** Loading fallback for lazy-loaded pages */
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#191b22]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
    </div>
  )
}

/** Wrap a page with the shared AdminRoute + AdminLayout */
function AdminPage({ children }: { children: ReactNode }) {
  return (
    <AdminRoute>
      <Suspense fallback={<PageLoader />}>
        <AdminLayout>{children}</AdminLayout>
      </Suspense>
    </AdminRoute>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton duration={4000} />
        <CustomerChatWidget />
        <Routes>
          {/* ── Public / Shop ───────────────────────────────────────── */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/products"           element={<ErrorBoundary><ProductsPage /></ErrorBoundary>} />
          <Route path="/products/:id"        element={<ErrorBoundary><ProductDetailPage /></ErrorBoundary>} />
          <Route path="/categories/:slug"    element={<ErrorBoundary><CategoryPage /></ErrorBoundary>} />
          <Route path="/wishlist"            element={<WishlistPage />} />
          <Route path="/cart"               element={<ErrorBoundary><CartPage /></ErrorBoundary>} />
          <Route path="/search"             element={<ErrorBoundary><SearchPage /></ErrorBoundary>} />
          <Route path="/compare"            element={<ComparePage />} />
          <Route path="/login"              element={<LoginPage />} />
          <Route path="/register"           element={<RegisterPage />} />
          <Route path="/forgot-password"    element={<ForgotPasswordPage />} />
          <Route path="/blog"              element={<BlogPage />} />
          <Route path="/blog/:slug"        element={<BlogDetailPage />} />
          <Route path="/contact"           element={<ContactPage />} />
          <Route path="/verify-email"       element={<VerifyEmailPage />} />
          <Route path="/verify-email-notice" element={<VerifyEmailNoticePage />} />
          <Route path="/reset-password"     element={<ResetPasswordPage />} />
          <Route path="/oauth/callback"     element={<OAuthCallbackPage />} />
          <Route path="/vouchers"           element={<VouchersPage />} />

          {/* ── Authenticated customer ──────────────────────────────── */}
          <Route path="/profile"          element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/profile/addresses" element={<PrivateRoute><AddressesPage /></PrivateRoute>} />
          <Route path="/checkout"         element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/orders"           element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/orders/:id"       element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
          <Route path="/orders/:id/return" element={<PrivateRoute><OrderReturnPage /></PrivateRoute>} />
          <Route path="/orders/returns"    element={<PrivateRoute><MyReturnsPage /></PrivateRoute>} />
          <Route path="/notifications"     element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />

          {/* ── Admin panel ──────────────────────────────────────────── */}
          <Route path="/admin"             element={<AdminPage><DashboardPage /></AdminPage>} />
          <Route path="/admin/users"       element={<AdminPage><AdminUsersPage /></AdminPage>} />
          <Route path="/admin/products"    element={<AdminPage><AdminProductsPage /></AdminPage>} />
          <Route path="/admin/categories"  element={<AdminPage><AdminCategoriesPage /></AdminPage>} />
          <Route path="/admin/brands"      element={<AdminPage><AdminBrandsPage /></AdminPage>} />
          <Route path="/admin/orders"      element={<AdminPage><AdminOrdersPage /></AdminPage>} />
          <Route path="/admin/vouchers"    element={<AdminPage><AdminVouchersPage /></AdminPage>} />
          <Route path="/admin/returns"     element={<AdminPage><AdminReturnsPage /></AdminPage>} />
          <Route path="/admin/messages"    element={<AdminPage><AdminMessagesPage /></AdminPage>} />
          <Route path="/admin/reviews"     element={<AdminPage><AdminReviewsPage /></AdminPage>} />
          <Route path="/admin/blog"        element={<AdminPage><AdminBlogPage /></AdminPage>} />
          <Route path="/admin/banners"     element={<AdminPage><AdminBannersPage /></AdminPage>} />
          <Route path="/admin/chat"        element={<AdminPage><AdminChatPage /></AdminPage>} />
          <Route path="/admin/flash-sales" element={<AdminPage><AdminFlashSalesPage /></AdminPage>} />
          <Route path="/admin/inventory"   element={<AdminPage><AdminInventoryPage /></AdminPage>} />
          <Route path="/admin/profile"     element={<AdminPage><AdminProfilePage /></AdminPage>} />

          {/* ── 404 catch-all ─────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
