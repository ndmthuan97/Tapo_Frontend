# Tapo Frontend — React SPA

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/shadcn/ui-black?style=for-the-badge&logo=shadcnui&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel&logoColor=white"/>
</p>

---

## Overview

Single-Page Application (SPA) frontend for the TAPO laptop e-commerce platform. Supports two surfaces: a customer-facing shop and a full admin panel, with Vietnamese/English internationalisation.

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| TypeScript | ~5.9 | Type safety |
| Vite | 8 | Dev server & build tool |
| Tailwind CSS | v4 | Utility-first styling |
| shadcn/ui + Radix UI | — | Accessible UI component library |
| React Router | v7 | Client-side routing |
| TanStack React Query | v5 | Server state management & caching |
| Axios | v1 | HTTP client |
| React Hook Form | v7 | Form state management |
| Zod | v4 | Schema validation |
| STOMP.js + SockJS | — | WebSocket client (real-time chat) |
| Recharts | v3 | Dashboard charts & graphs |
| react-i18next / i18next | — | Internationalisation (EN / VI) |
| Supabase JS | v2 | Direct file upload to Supabase Storage |
| EmailJS | v4 | Contact form email sending |
| xlsx | — | Excel export |
| Sonner | v2 | Toast notification system |
| lucide-react | — | Icon library |
| Prettier | v3 | Code formatting |
| ESLint | v9 | Linting |

---

## Project Structure

```
src/
├── App.tsx                  # Route definitions (React Router v7)
├── main.tsx                 # Entry point
├── index.css                # Global styles + Tailwind directives
├── features/
│   ├── shop/                # Customer-facing pages
│   │   ├── auth/            # Login, register, forgot password, email verify
│   │   ├── home/            # Home page, product listing, product detail
│   │   ├── cart/            # Cart, checkout, order confirmation
│   │   └── user/            # Account settings, order history, wishlist, reviews
│   └── admin/               # Admin panel
│       ├── pages/           # Dashboard, products, orders, vouchers, reviews,
│       │                    #   inventory, blog, users, flash sale, banners,
│       │                    #   statistics, return requests, chat management
│       ├── components/      # Admin-specific components
│       ├── hooks/           # Admin data hooks
│       └── api/             # Admin API calls
├── components/              # Shared UI components
├── hooks/                   # Shared custom hooks
├── lib/                     # axios instance, query client, utils
└── utils/                   # Format helpers, constants
```

---

## Running Locally

### Prerequisites
- Node.js 20+
- npm 10+

### Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev
```

### Production Build

```bash
npm run build
# Output: dist/
```

### Other Scripts

```bash
npm run lint          # ESLint check
npm run format        # Prettier auto-format (src/**/*.{ts,tsx,css,json})
npm run format:check  # Prettier check only (CI)
npm run preview       # Preview production build locally
```

---

## Environment Variables

Create a `.env` file at the project root:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

For production, set the same variables in Vercel project settings (or `.env.production`).

---

## Deployment (Vercel)

The project includes `vercel.json` with SPA rewrite rules so direct URL access works correctly. Deploy by pushing to `main` — Vercel auto-builds.

**Build settings:**
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite

---

## Internationalisation

UI supports **English** and **Vietnamese** via `react-i18next`.  
Translation files live in `src/` (or `public/locales/`). Language can be switched from the UI.

---

## Key Pages

### Shop (Customer)
| Route | Page |
|-------|------|
| `/` | Home (featured products, flash sale banner) |
| `/products` | Product listing with filters |
| `/products/:slug` | Product detail (reviews, specs, instalment calculator) |
| `/cart` | Shopping cart |
| `/checkout` | Order & payment |
| `/orders` | Order history |
| `/account` | Profile settings |
| `/wishlist` | Saved products |
| `/blog` | Blog & news |
| `/login` / `/register` | Auth pages |

### Admin
| Route | Panel |
|-------|-------|
| `/admin/dashboard` | Revenue + order overview charts |
| `/admin/products` | Product CRUD |
| `/admin/orders` | Order management + status updates |
| `/admin/reviews` | Review approve/reject/bulk actions |
| `/admin/vouchers` | Voucher CRUD + toggle |
| `/admin/flash-sales` | Flash sale campaigns |
| `/admin/inventory` | Stock import/export |
| `/admin/blog` | Blog post management |
| `/admin/users` | User list + role management |
| `/admin/banners` | Homepage banner management |
| `/admin/return-requests` | Return request processing |
| `/admin/chat` | Staff chat panel |
| `/admin/statistics` | Sales analytics |
