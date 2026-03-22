# 🎨 TAPO FRONTEND - TECHNICAL SPECIFICATION DOCUMENT

**Phiên bản:** 1.1  
**Ngày cập nhật:** 2026-03-20  
**Framework:** React 19 + TypeScript 5.9  
**Build Tool:** Vite 8  
**UI Library:** shadcn/ui + Tailwind CSS v4  
**Deployment:** Vercel  

---

## 1. Tổng Quan Kỹ Thuật

| Thành phần           | Công nghệ / Phiên bản                    |
|-----------------------|-------------------------------------------|
| **Language**          | TypeScript 5.9                            |
| **UI Framework**      | React 19                                  |
| **Build Tool**        | Vite 8                                    |
| **Routing**           | React Router v7                           |
| **State Management**  | React Context + React Query (TanStack)    |
| **HTTP Client**       | Axios                                     |
| **UI Components**     | shadcn/ui (Radix UI primitives)           |
| **Styling**           | Tailwind CSS v4 + CSS Variables           |
| **Theming**           | next-themes (dark/light mode)             |
| **Form Handling**     | React Hook Form + Zod                     |
| **Real-time**         | SockJS + STOMP.js                         |
| **Rich Text Editor**  | TipTap                                    |
| **Charts**            | Recharts                                  |
| **Icons**             | Lucide React                              |
| **Toast**             | Sonner (tích hợp sẵn shadcn/ui)          |
| **Date**              | date-fns                                  |
| **Linting**           | ESLint 9 + eslint-plugin-react-hooks      |
| **Deployment**        | Vercel                                    |

---

## 2. Kiến Trúc Frontend

```
┌─────────────────────────────────────────────────────┐
│                    PAGES LAYER                       │
│                                                     │
│  Pages / Layouts       Route Definitions            │
│  Page-level components  Lazy loading                │
├─────────────────────────────────────────────────────┤
│                    FEATURES LAYER                    │
│                                                     │
│  Feature Components    Feature Hooks                │
│  Domain-specific UI    Business logic               │
├─────────────────────────────────────────────────────┤
│                    SHARED LAYER                      │
│                                                     │
│  shadcn/ui Components  Utility Functions            │
│  Common Hooks          Type Definitions             │
│  Constants             Validators                   │
├─────────────────────────────────────────────────────┤
│                    CORE LAYER                        │
│                                                     │
│  API Client (Axios)    Auth Context                 │
│  WebSocket Client      React Query Config           │
│  Route Guards          Error Boundary               │
└─────────────────────────────────────────────────────┘
```

---

## 3. Cấu Trúc Thư Mục

```
src/
├── main.tsx                                # Entry point
├── App.tsx                                 # Root component + Router
├── index.css                               # Tailwind directives + CSS variables
├── vite-env.d.ts                           # Vite type declarations
│
├── api/                                    # API Layer
│   ├── axiosClient.ts                      # Axios instance + interceptors
│   ├── authApi.ts                          # Auth endpoints
│   ├── productApi.ts                       # Product endpoints
│   ├── categoryApi.ts                      # Category endpoints
│   ├── brandApi.ts                         # Brand endpoints
│   ├── cartApi.ts                          # Cart endpoints
│   ├── orderApi.ts                         # Order endpoints
│   ├── paymentApi.ts                       # Payment endpoints
│   ├── inventoryApi.ts                     # Inventory endpoints
│   ├── voucherApi.ts                       # Voucher endpoints
│   ├── flashSaleApi.ts                     # Flash Sale endpoints
│   ├── reviewApi.ts                        # Review endpoints
│   ├── wishlistApi.ts                      # Wishlist endpoints
│   ├── chatApi.ts                          # Chat REST endpoints
│   ├── blogApi.ts                          # Blog endpoints
│   ├── userApi.ts                          # User endpoints
│   └── dashboardApi.ts                     # Dashboard endpoints
│
├── components/                             # shadcn/ui + Shared Components
│   ├── ui/                                 # 🔧 shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── avatar.tsx
│   │   ├── toast.tsx                       # Sonner toast
│   │   ├── tooltip.tsx
│   │   ├── popover.tsx
│   │   ├── command.tsx                     # Command palette / search
│   │   ├── form.tsx                        # React Hook Form integration
│   │   ├── pagination.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── carousel.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio-group.tsx
│   │   ├── slider.tsx                      # Price range slider
│   │   ├── switch.tsx
│   │   ├── textarea.tsx
│   │   ├── scroll-area.tsx
│   │   ├── collapsible.tsx
│   │   ├── alert.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── progress.tsx
│   │   ├── sidebar.tsx                     # Admin sidebar component
│   │   └── chart.tsx                       # Recharts wrapper
│   │
│   ├── layout/                             # Layout Components
│   │   ├── Header.tsx                      # Logo, Search, Cart, UserMenu
│   │   ├── Footer.tsx
│   │   ├── AdminSidebar.tsx                # Admin sidebar navigation
│   │   ├── CustomerLayout.tsx              # Layout cho khách hàng
│   │   └── AdminLayout.tsx                 # Layout cho admin/staff
│   │
│   └── common/                             # Domain-shared Components
│       ├── ProductCard.tsx                  # Card sản phẩm trên grid
│       ├── ProductGrid.tsx                 # Grid responsive
│       ├── ProductFilter.tsx               # Bộ lọc sidebar
│       ├── PriceDisplay.tsx                # Hiển thị giá + giá gốc
│       ├── ImageGallery.tsx                # Gallery ảnh sản phẩm
│       ├── StarRating.tsx                  # Component rating sao
│       ├── ChatWidget.tsx                  # Floating chat widget
│       ├── CompareBar.tsx                  # Floating compare bar
│       ├── CountdownTimer.tsx              # Flash sale countdown
│       ├── EmptyState.tsx                  # Empty state illustration
│       ├── ErrorBoundary.tsx               # React error boundary
│       └── ProtectedRoute.tsx              # Route guard by role
│
├── features/                               # Feature Modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── GoogleLoginButton.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       └── RegisterPage.tsx
│   │
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── ProductSpecs.tsx
│   │   │   ├── ProductReviews.tsx
│   │   │   ├── CompareTable.tsx
│   │   │   └── RelatedProducts.tsx
│   │   ├── hooks/
│   │   │   ├── useProducts.ts
│   │   │   ├── useProductDetail.ts
│   │   │   └── useProductCompare.ts
│   │   └── pages/
│   │       ├── ProductListPage.tsx
│   │       ├── ProductDetailPage.tsx
│   │       └── ComparePage.tsx
│   │
│   ├── cart/
│   │   ├── components/
│   │   │   ├── CartList.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── hooks/
│   │   │   └── useCart.ts
│   │   └── pages/
│   │       └── CartPage.tsx
│   │
│   ├── checkout/
│   │   ├── components/
│   │   │   ├── AddressSelector.tsx
│   │   │   ├── VoucherInput.tsx
│   │   │   ├── OrderSummary.tsx
│   │   │   └── PaymentResult.tsx
│   │   ├── hooks/
│   │   │   └── useCheckout.ts
│   │   └── pages/
│   │       ├── CheckoutPage.tsx
│   │       ├── PaymentSuccessPage.tsx
│   │       └── PaymentFailPage.tsx
│   │
│   ├── orders/
│   │   ├── components/
│   │   │   ├── OrderList.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   ├── OrderTimeline.tsx
│   │   │   └── ReturnRequestForm.tsx
│   │   ├── hooks/
│   │   │   └── useOrders.ts
│   │   └── pages/
│   │       ├── OrderListPage.tsx
│   │       └── OrderDetailPage.tsx
│   │
│   ├── wishlist/
│   │   ├── hooks/
│   │   │   └── useWishlist.ts
│   │   └── pages/
│   │       └── WishlistPage.tsx
│   │
│   ├── profile/
│   │   ├── components/
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── AddressManagement.tsx
│   │   │   └── ChangePasswordForm.tsx
│   │   └── pages/
│   │       └── ProfilePage.tsx
│   │
│   ├── chat/
│   │   ├── components/
│   │   │   ├── ChatWidget.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── hooks/
│   │   │   └── useChat.ts
│   │   └── services/
│   │       └── websocketClient.ts
│   │
│   ├── blog/
│   │   ├── components/
│   │   │   ├── BlogList.tsx
│   │   │   ├── BlogCard.tsx
│   │   │   └── BlogContent.tsx
│   │   ├── hooks/
│   │   │   └── useBlog.ts
│   │   └── pages/
│   │       ├── BlogListPage.tsx
│   │       └── BlogDetailPage.tsx
│   │
│   ├── flash-sale/
│   │   ├── components/
│   │   │   ├── FlashSaleBanner.tsx
│   │   │   └── FlashSaleProductCard.tsx
│   │   └── hooks/
│   │       └── useFlashSale.ts
│   │
│   └── installment/
│       ├── components/
│       │   ├── InstallmentCalculator.tsx
│       │   └── InstallmentForm.tsx
│       └── pages/
│           └── InstallmentPage.tsx
│
├── admin/                                  # Admin Panel
│   ├── components/
│   │   ├── StatsCard.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── TopProductsChart.tsx
│   │   └── OrderStatusPieChart.tsx
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── ProductManagementPage.tsx
│   │   ├── OrderManagementPage.tsx
│   │   ├── InventoryManagementPage.tsx
│   │   ├── VoucherManagementPage.tsx
│   │   ├── FlashSaleManagementPage.tsx
│   │   ├── UserManagementPage.tsx
│   │   ├── ReviewManagementPage.tsx
│   │   ├── BlogManagementPage.tsx
│   │   ├── ChatManagementPage.tsx
│   │   └── SettingsPage.tsx
│   └── hooks/
│       └── useDashboard.ts
│
├── context/                                # React Context Providers
│   ├── AuthContext.tsx                     # Authentication state
│   └── CompareContext.tsx                  # Product compare state
│
├── hooks/                                  # Global Custom Hooks
│   ├── useDebounce.ts                      # Debounce cho search
│   ├── useLocalStorage.ts                  # Persistent local state
│   ├── useMediaQuery.ts                    # Responsive breakpoints
│   ├── useInfiniteScroll.ts                # Infinite scroll
│   └── useClickOutside.ts                 # Close dropdown on outside click
│
├── types/                                  # TypeScript Type Definitions
│   ├── auth.types.ts
│   ├── product.types.ts
│   ├── order.types.ts
│   ├── cart.types.ts
│   ├── inventory.types.ts
│   ├── promotion.types.ts
│   ├── review.types.ts
│   ├── chat.types.ts
│   ├── blog.types.ts
│   ├── user.types.ts
│   └── api.types.ts                        # ApiResponse, PageResponse
│
├── utils/                                  # Utility Functions
│   ├── cn.ts                               # clsx + tailwind-merge helper
│   ├── formatCurrency.ts                   # Format VND: 15.000.000₫
│   ├── formatDate.ts                       # Format dates
│   ├── slugify.ts                          # URL slugification
│   ├── validationSchemas.ts                # Zod schemas
│   ├── constants.ts                        # App-wide constants
│   └── storage.ts                          # localStorage helpers
│
├── lib/                                    # Library configs (shadcn convention)
│   └── utils.ts                            # cn() helper (re-export)
│
└── assets/                                 # Static Assets
    ├── images/
    ├── icons/
    └── fonts/
```

---

## 4. shadcn/ui Setup & Configuration

### 4.1. Khởi Tạo shadcn/ui
```bash
# Cài Tailwind CSS v4
npm install tailwindcss @tailwindcss/vite

# Khởi tạo shadcn/ui
npx shadcn@latest init

# Chọn cấu hình:
# ✔ Style: New York
# ✔ Base color: Zinc
# ✔ CSS variables: Yes
```

### 4.2. Cài Đặt Components
```bash
# Cài tất cả shadcn/ui components cần dùng
npx shadcn@latest add button input label select dialog sheet \
  dropdown-menu badge card table tabs separator skeleton avatar \
  toast tooltip popover command form pagination breadcrumb \
  carousel checkbox radio-group slider switch textarea \
  scroll-area collapsible alert alert-dialog aspect-ratio \
  progress sidebar chart
```

### 4.3. components.json (shadcn config)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### 4.4. Vite Config (Path Aliases + Tailwind)
```typescript
// vite.config.ts
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 4.5. tsconfig.json (Path Aliases)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 5. Styling Architecture (Tailwind + shadcn/ui)

### 5.1. index.css (Tailwind Directives + Theme)
```css
@import "tailwindcss";

/* ===== THEME VARIABLES (shadcn/ui convention) ===== */
:root {
  --radius: 0.625rem;

  /* Light Theme */
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);

  /* Custom brand colors */
  --brand-primary: oklch(0.546 0.245 262.881);
  --brand-success: oklch(0.627 0.194 149.214);
  --brand-warning: oklch(0.769 0.188 70.08);
  --brand-danger: oklch(0.577 0.245 27.325);

  /* Sidebar */
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
  
  /* Chart colors */
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.608 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);

  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.985 0 0);
  --sidebar-primary-foreground: oklch(0.205 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}
```

### 5.2. `cn()` Utility (Class Merge)
```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 5.3. Component Usage Example
```tsx
// Sử dụng shadcn/ui + Tailwind classes
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {product.isOnSale && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Sale
          </Badge>
        )}
      </div>

      <CardHeader className="p-4 pb-2">
        <p className="text-sm text-muted-foreground">{product.brandName}</p>
        <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-brand-primary">
            {formatCurrency(product.displayPrice)}
          </span>
          {product.isOnSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Button className="flex-1" size="sm">
            Thêm vào giỏ
          </Button>
          <Button variant="outline" size="icon" className="shrink-0">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 6. Dependencies

```bash
# ===== Core =====
npm install react-router-dom @tanstack/react-query

# ===== HTTP & Forms =====
npm install axios react-hook-form @hookform/resolvers zod

# ===== shadcn/ui requirements =====
npm install tailwindcss @tailwindcss/vite        # Tailwind v4
npm install clsx tailwind-merge                   # cn() utility
npm install class-variance-authority               # Component variants
npm install lucide-react                           # Icons
npm install next-themes                            # Dark/Light mode
npm install sonner                                 # Toast notifications
npm install @radix-ui/react-slot                   # Radix slot

# ===== Real-time =====
npm install sockjs-client @stomp/stompjs

# ===== Rich text (blog admin) =====
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image

# ===== Charts (dashboard admin) =====
npm install recharts

# ===== Utilities =====
npm install date-fns react-helmet-async

# ===== Dev =====
npm install -D @types/sockjs-client
```

---

## 7. Routing Structure

```tsx
// App.tsx
<Routes>
  {/* ===== PUBLIC ===== */}
  <Route element={<CustomerLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/products" element={<ProductListPage />} />
    <Route path="/products/:slug" element={<ProductDetailPage />} />
    <Route path="/compare" element={<ComparePage />} />
    <Route path="/blog" element={<BlogListPage />} />
    <Route path="/blog/:slug" element={<BlogDetailPage />} />
    <Route path="/flash-sale" element={<FlashSalePage />} />
  </Route>

  {/* ===== AUTH ===== */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  {/* ===== CUSTOMER (Protected) ===== */}
  <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
    <Route element={<CustomerLayout />}>
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      <Route path="/payment/fail" element={<PaymentFailPage />} />
      <Route path="/orders" element={<OrderListPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/installment/:productId" element={<InstallmentPage />} />
    </Route>
  </Route>

  {/* ===== ADMIN / STAFF (Protected) ===== */}
  <Route element={<ProtectedRoute roles={['ADMIN', 'SALES_STAFF', 'WAREHOUSE_STAFF']} />}>
    <Route element={<AdminLayout />}>
      <Route path="/admin" element={<DashboardPage />} />
      <Route path="/admin/products" element={<ProductManagementPage />} />
      <Route path="/admin/orders" element={<OrderManagementPage />} />
      <Route path="/admin/inventory" element={<InventoryManagementPage />} />
      <Route path="/admin/vouchers" element={<VoucherManagementPage />} />
      <Route path="/admin/flash-sales" element={<FlashSaleManagementPage />} />
      <Route path="/admin/users" element={<UserManagementPage />} />
      <Route path="/admin/reviews" element={<ReviewManagementPage />} />
      <Route path="/admin/blogs" element={<BlogManagementPage />} />
      <Route path="/admin/chat" element={<ChatManagementPage />} />
      <Route path="/admin/settings" element={<SettingsPage />} />
    </Route>
  </Route>

  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

---

## 8. API Client Architecture

### 8.1. Axios Instance + Auto Refresh
```typescript
// api/axiosClient.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return axiosClient(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
```

---

## 9. State Management

| Loại State | Giải pháp | Dữ liệu |
|-----------|-----------|----------|
| **Server state** | React Query | Products, Orders, Users, Reviews, Blog... |
| **Auth state** | React Context | user, isLoggedIn, login, logout |
| **Compare state** | React Context | compareList, add/remove |
| **Theme** | next-themes | dark/light mode |
| **Form state** | React Hook Form | Checkout, Register, ProductForm... |
| **URL state** | React Router (searchParams) | Filters, pagination, sort |

```typescript
// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import productApi from '@/api/productApi';

export function useProducts(filters: ProductFilter) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.getAll(filters).then(res => res.data.data),
    staleTime: 1000 * 60 * 5,
  });
}
```

---

## 10. TypeScript Type Definitions

```typescript
// types/api.types.ts
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

```typescript
// types/product.types.ts
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  thumbnail: string;
  avgRating: number;
  reviewCount: number;
  stock: number;
  brandName: string;
  categoryName: string;
  displayPrice: number;
  isOnSale: boolean;
}

export interface ProductDetail extends Product {
  description: string;
  images: ProductImage[];
  specifications: ProductSpecifications;
  soldCount: number;
  status: string;
}

export interface ProductSpecifications {
  cpu: string;
  ram: string;
  storage: string;
  gpu: string;
  screenSize: string;
  screenResolution: string;
  battery: string;
  weight: string;
  ports: string;
  os: string;
  color: string;
  warranty: string;
}
```

---

## 11. WebSocket Chat Client

```typescript
// features/chat/services/websocketClient.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL;

class WebSocketClient {
  private client: Client;
  private subscriptions = new Map<string, any>();

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  }

  connect(token: string, onConnect: () => void) {
    this.client.connectHeaders = { Authorization: `Bearer ${token}` };
    this.client.onConnect = onConnect;
    this.client.activate();
  }

  subscribeToRoom(roomId: string, callback: (msg: any) => void) {
    const sub = this.client.subscribe(`/topic/room/${roomId}`, (message) =>
      callback(JSON.parse(message.body))
    );
    this.subscriptions.set(roomId, sub);
  }

  sendMessage(roomId: string, content: string) {
    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ roomId, content }),
    });
  }

  disconnect() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    this.client.deactivate();
  }
}

export const wsClient = new WebSocketClient();
```

---

## 12. Responsive Design (Tailwind Breakpoints)

| Breakpoint  | Prefix   | Width       | Layout                       |
|-------------|----------|-------------|------------------------------|
| Mobile      | (default)| < 640px     | 1 col, hamburger menu        |
| Small       | `sm:`    | ≥ 640px     | 2 cols                       |
| Tablet      | `md:`    | ≥ 768px     | 2-3 cols                     |
| Desktop     | `lg:`    | ≥ 1024px    | 3-4 cols, full sidebar       |
| Large       | `xl:`    | ≥ 1280px    | 4+ cols, max-width container |
| Extra Large | `2xl:`   | ≥ 1536px    | Wide layouts                 |

```tsx
// Responsive grid ví dụ
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {products.map(product => <ProductCard key={product.id} product={product} />)}
</div>
```

---

## 13. Performance Optimization

| Kỹ thuật              | Áp dụng                                        |
|------------------------|-------------------------------------------------|
| **Code Splitting**     | `React.lazy()` cho mỗi Page component          |
| **Image Lazy Load**    | `loading="lazy"` cho product images             |
| **React Query Cache**  | `staleTime: 5min` cho product list              |
| **Memoization**        | `React.memo()` cho ProductCard, CartItem         |
| **Debounce**           | 300ms debounce cho search input                  |
| **Font Loading**       | `font-display: swap` cho Google Fonts            |
| **Tailwind Purge**     | Vite tự động tree-shake CSS unused              |

---

## 14. Environment & Deployment

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# .env.production
VITE_API_BASE_URL=https://api.tapo.com
VITE_WS_URL=https://api.tapo.com/ws
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Vercel Config:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [{
    "source": "/assets/(.*)",
    "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
  }]
}
```

---

## 15. Tổng Kết

| Metric              | Giá trị  |
|----------------------|----------|
| **Tổng số pages**    | 30       |
| **shadcn/ui components** | 30+  |
| **Feature modules**  | 11       |
| **API modules**      | 17       |
| **Custom hooks**     | 15+      |
| **Type files**       | 11       |
