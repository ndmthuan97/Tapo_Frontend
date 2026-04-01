import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/context/auth-context'

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
import { BlogPage }            from '@/features/shop/home/pages/BlogPage'
import { BlogDetailPage }      from '@/features/shop/home/pages/BlogDetailPage'
import { ContactPage }         from '@/features/shop/home/pages/ContactPage'

// ── Admin ───────────────────────────────────────────────────────────────────
import { AdminLayout }      from '@/features/admin/components/AdminLayout'
import { DashboardPage }    from '@/features/admin/pages/DashboardPage'
import { AdminUsersPage }   from '@/features/admin/pages/AdminUsersPage'
import { AdminProfilePage } from '@/features/admin/pages/AdminProfilePage'
import { AdminProductsPage } from '@/features/admin/pages/AdminProductsPage'
import { AdminCategoriesPage } from '@/features/admin/pages/AdminCategoriesPage'
import { AdminBrandsPage }  from '@/features/admin/pages/AdminBrandsPage'
import { AdminOrdersPage }  from '@/features/admin/pages/AdminOrdersPage'
import { AdminMessagesPage } from '@/features/admin/pages/AdminMessagesPage'
import { AdminReviewsPage } from '@/features/admin/pages/AdminReviewsPage'

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
          <Route path="/products"           element={<ProductsPage />} />
          <Route path="/products/:id"        element={<ProductDetailPage />} />
          <Route path="/categories/:slug"    element={<CategoryPage />} />
          <Route path="/wishlist"            element={<WishlistPage />} />
          <Route path="/cart"               element={<CartPage />} />
          <Route path="/search"             element={<SearchPage />} />
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

          {/* ── Authenticated customer ──────────────────────────────── */}
          <Route path="/profile"          element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/profile/addresses" element={<PrivateRoute><AddressesPage /></PrivateRoute>} />
          <Route path="/checkout"         element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/orders"           element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/orders/:id"       element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
          <Route path="/orders/:id/return" element={<PrivateRoute><OrderReturnPage /></PrivateRoute>} />

          {/* ── Admin panel ──────────────────────────────────────────── */}
          <Route path="/admin"             element={<AdminPage><DashboardPage /></AdminPage>} />
          <Route path="/admin/users"       element={<AdminPage><AdminUsersPage /></AdminPage>} />
          <Route path="/admin/products"    element={<AdminPage><AdminProductsPage /></AdminPage>} />
          <Route path="/admin/categories"  element={<AdminPage><AdminCategoriesPage /></AdminPage>} />
          <Route path="/admin/brands"      element={<AdminPage><AdminBrandsPage /></AdminPage>} />
          <Route path="/admin/orders"      element={<AdminPage><AdminOrdersPage /></AdminPage>} />
          <Route path="/admin/messages"    element={<AdminPage><AdminMessagesPage /></AdminPage>} />
          <Route path="/admin/reviews"     element={<AdminPage><AdminReviewsPage /></AdminPage>} />
          <Route path="/admin/profile"     element={<AdminPage><AdminProfilePage /></AdminPage>} />
          {/* ── 404 catch-all ─────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
