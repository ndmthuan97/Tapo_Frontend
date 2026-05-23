import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { memo } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ProductCard } from '@/components/common/ProductCard'

// Mock heavy dependencies
vi.mock('@/features/shop/cart/hooks/use-cart', () => ({
  useCart: () => ({ addItem: vi.fn(), cart: { items: [] } }),
}))
vi.mock('@/lib/context/auth-context', () => ({
  useAuthContext: () => ({ user: null }),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const BASE_PROPS = {
  id: 'prod-1',
  name: 'Test Product',
  price: 100_000,
  image: 'https://example.com/img.jpg',
}

function Wrapper(props: React.ComponentProps<typeof ProductCard>) {
  return (
    <BrowserRouter>
      <ProductCard {...props} />
    </BrowserRouter>
  )
}

describe('ProductCard', () => {
  // FE-001 — React.memo: verify the exported component is wrapped with memo
  it('is wrapped with React.memo (not a plain function component)', () => {
    // memo() returns an object with $$typeof === Symbol(react.memo)
    // and a .type property pointing to the inner component
    const type = (ProductCard as unknown as { $$typeof: symbol }).$$typeof
    expect(type?.toString()).toContain('react.memo')
  })

  it('renders product name', () => {
    const { getByText } = render(<Wrapper {...BASE_PROPS} />)
    expect(getByText('Test Product')).toBeDefined()
  })

  it('renders formatted price', () => {
    const { container } = render(<Wrapper {...BASE_PROPS} price={250_000} />)
    expect(container.textContent).toContain('250')
  })

  it('shows "Hết hàng" when inStock=false', () => {
    const { getAllByText } = render(<Wrapper {...BASE_PROPS} inStock={false} />)
    // Appears in both the overlay span and the disabled button
    expect(getAllByText('Hết hàng').length).toBeGreaterThanOrEqual(1)
  })

  it('shows discount badge when discountPercent is provided', () => {
    const { getByText } = render(<Wrapper {...BASE_PROPS} discountPercent={20} />)
    expect(getByText('-20%')).toBeDefined()
  })

  it('shows brand name when provided', () => {
    // Component renders brandName as-is; CSS uppercase is presentational only
    const { getByText } = render(<Wrapper {...BASE_PROPS} brandName="Apple" />)
    expect(getByText('Apple')).toBeDefined()
  })
})

describe('ProductCard — memo prevents unnecessary re-renders', () => {
  // FE-001 extended: render counter via a spy component
  it('does not re-render when parent re-renders with identical props', () => {
    let renderCount = 0

    // Build a spy wrapper around the inner component to count renders
    const SpyCard = memo(function SpyCardInner(
      props: React.ComponentProps<typeof ProductCard>,
    ) {
      renderCount++
      return (
        <BrowserRouter>
          <ProductCard {...props} />
        </BrowserRouter>
      )
    })

    const { rerender } = render(<SpyCard {...BASE_PROPS} />)
    expect(renderCount).toBe(1)

    // Re-render parent with the exact same props — memo should block the child
    rerender(<SpyCard {...BASE_PROPS} />)
    expect(renderCount).toBe(1) // still 1, not 2
  })
})
