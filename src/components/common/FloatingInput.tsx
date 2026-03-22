import { useState, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  rightSlot?: React.ReactNode
}

function FloatingInput({ id, label, className, rightSlot, ...props }: FloatingInputProps) {
  const [focused, setFocused] = useState(false)
  const hasValue = Boolean(props.value)
  const lifted = focused || hasValue

  return (
    <div className="relative">
      <input
        id={id}
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
        placeholder=""
        className={cn(
          'peer w-full rounded-xl border border-gray-200 bg-white px-4 pb-2.5 pt-5 text-sm text-gray-900 outline-none transition-all',
          'placeholder-transparent',
          focused
            ? 'border-orange-400 shadow-[0_0_0_3px_rgba(249,115,22,0.12)]'
            : 'hover:border-gray-300',
          rightSlot ? 'pr-12' : '',
          className,
        )}
      />

      {/* Floating label */}
      <label
        htmlFor={id}
        className={cn(
          'pointer-events-none absolute left-4 text-gray-400 transition-all duration-150 ease-in-out',
          lifted
            ? '-top-2 bg-white px-1 text-[11px] font-medium text-orange-500'
            : 'top-1/2 -translate-y-1/2 text-sm',
        )}
      >
        {label}
      </label>

      {/* Right slot (e.g. eye icon) */}
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
  )
}

export { FloatingInput }
