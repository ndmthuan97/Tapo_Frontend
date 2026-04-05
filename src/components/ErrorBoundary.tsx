/**
 * ErrorBoundary — react skill §6: class component is required for componentDidCatch.
 * Hooks (useEffect, useMemo, etc.) CANNOT catch render-time errors.
 *
 * Features:
 * - Catches render errors in subtree (not async, not event handlers)
 * - Customisable fallback via `fallback` prop
 * - `onError` callback for external logging (e.g. Sentry, DataDog)
 * - Default fallback with retry button
 * - Resets state on `key` change (react skill §6: key-based reset pattern)
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle } from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────────────────────

interface Props {
  children: ReactNode
  /** Custom fallback UI. Receives error + reset function. */
  fallback?: (error: Error, reset: () => void) => ReactNode
  /** Called when an error is caught — use for external logging (Sentry etc.) */
  onError?: (error: Error, info: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

// ── Component ───────────────────────────────────────────────────────────────────

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in all environments; forward to external service via prop
    console.error('[ErrorBoundary] Render error caught:', error, info.componentStack)
    this.props.onError?.(error, info)
  }

  reset = () => this.setState({ hasError: false, error: null })

  render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (!hasError || !error) return children

    // Custom fallback wins
    if (fallback) return fallback(error, this.reset)

    // ── Default fallback UI ────────────────────────────────────────────────────
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
        <div className="rounded-2xl border border-red-100 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-8 max-w-md w-full space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 dark:bg-red-500/10 p-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Có lỗi xảy ra
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Trang này gặp sự cố không mong muốn. Vui lòng thử lại.
            </p>
          </div>
          {/* Dev mode: show error message */}
          {import.meta.env.DEV && (
            <pre className="text-xs text-left text-red-500 bg-red-50 dark:bg-red-950 rounded-lg p-3 overflow-auto max-h-32">
              {error.message}
            </pre>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={this.reset}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
            >
              Thử lại
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-medium transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    )
  }
}

// ── Convenience wrapper ──────────────────────────────────────────────────────────

/**
 * withErrorBoundary — HOC wrapping any component with an ErrorBoundary.
 * react skill §6: use HOC pattern for cross-cutting concerns.
 *
 * Usage: const SafeProductList = withErrorBoundary(ProductList)
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  boundaryProps?: Omit<Props, 'children'>
) {
  const displayName = WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'

  function WithBoundary(props: P) {
    return (
      <ErrorBoundary {...boundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }

  WithBoundary.displayName = `withErrorBoundary(${displayName})`
  return WithBoundary
}
