import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderBold } from '@/features/shop/home/pages/BlogDetailPage'

// Helper: wrap output in a div so we can query it
function Wrapper({ text, cls }: { text: string; cls?: string }) {
  return <span>{renderBold(text, cls)}</span>
}

describe('renderBold', () => {
  // FE-002
  it('renders plain text as-is with no <strong> nodes', () => {
    const { container } = render(<Wrapper text="Hello world" />)
    expect(container.querySelector('strong')).toBeNull()
    expect(container.textContent).toBe('Hello world')
  })

  // FE-003
  it('wraps **text** in a <strong> element', () => {
    render(<Wrapper text="Hello **world**" />)
    const strong = screen.getByText('world')
    expect(strong.tagName).toBe('STRONG')
  })

  // FE-004
  it('handles multiple bold segments independently', () => {
    render(<Wrapper text="**A** and **B**" />)
    const strongs = document.querySelectorAll('strong')
    expect(strongs).toHaveLength(2)
    expect(strongs[0].textContent).toBe('A')
    expect(strongs[1].textContent).toBe('B')
  })

  // FE-005 — XSS: script inside ** must render as text, never execute
  it('does not inject or execute script tags placed inside bold markers', () => {
    const { container } = render(
      <Wrapper text="**<script>window.__xss=1</script>**" />,
    )
    // No actual <script> element in DOM
    expect(container.querySelector('script')).toBeNull()
    // Global side-effect must not have run
    expect((window as Record<string, unknown>).__xss).toBeUndefined()
    // The text should appear literally inside <strong>
    const strong = container.querySelector('strong')
    expect(strong).not.toBeNull()
    expect(strong!.textContent).toContain('<script>')
  })

  it('applies boldClassName to <strong> elements', () => {
    render(<Wrapper text="**bold**" cls="custom-class" />)
    const strong = screen.getByText('bold')
    expect(strong).toHaveClass('custom-class')
  })

  it('returns empty output for empty string', () => {
    const { container } = render(<Wrapper text="" />)
    expect(container.textContent).toBe('')
  })
})
