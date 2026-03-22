import { type ReactNode, type CSSProperties } from 'react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

type AnimationVariant = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'fade' | 'zoom'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  variant?: AnimationVariant
  delay?: number      // ms
  duration?: number   // ms
  threshold?: number
  once?: boolean
}

const INITIAL_STYLES: Record<AnimationVariant, CSSProperties> = {
  'fade-up':    { opacity: 0, transform: 'translateY(40px)' },
  'fade-down':  { opacity: 0, transform: 'translateY(-40px)' },
  'fade-left':  { opacity: 0, transform: 'translateX(40px)' },
  'fade-right': { opacity: 0, transform: 'translateX(-40px)' },
  'fade':       { opacity: 0 },
  'zoom':       { opacity: 0, transform: 'scale(0.92)' },
}

const VISIBLE_STYLE: CSSProperties = { opacity: 1, transform: 'none' }

/**
 * Wraps children and animates them into view when scrolled into the viewport.
 * Uses Intersection Observer under the hood — zero external deps.
 */
function ScrollReveal({
  children,
  className,
  variant = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.12,
  once = true,
}: ScrollRevealProps) {
  const { ref, inView } = useInView({ threshold, once })

  const style: CSSProperties = {
    ...(inView ? VISIBLE_STYLE : INITIAL_STYLES[variant]),
    transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
    transitionDelay: `${delay}ms`,
    willChange: 'opacity, transform',
  }

  return (
    <div ref={ref} style={style} className={cn(className)}>
      {children}
    </div>
  )
}

export { ScrollReveal }
export type { AnimationVariant }
