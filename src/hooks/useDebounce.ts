import { useState, useEffect } from 'react'

/**
 * Debounce a value by specified delay (ms).
 * Extracted as a reusable hook to avoid inline setTimeout patterns.
 *
 * @example
 * const debouncedSearch = useDebounce(searchInput, 350)
 * useEffect(() => { fetchData(debouncedSearch) }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
