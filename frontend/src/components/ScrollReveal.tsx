import { useEffect, useRef, useState } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  once?: boolean
}

export default function ScrollReveal({ children, className = '', delay = 0, direction = 'up', once = true }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReduced) {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); if (once) obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [once, prefersReduced])

  const dirStyles: Record<string, string> = {
    up: 'translate-y-12',
    down: '-translate-y-12',
    left: 'translate-x-12',
    right: '-translate-x-12',
    none: '',
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-[800ms] [cubic-bezier(0.22,1,0.36,1)] ${visible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${dirStyles[direction]}`} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
