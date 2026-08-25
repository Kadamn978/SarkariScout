import { useRef, useCallback } from 'react'

export default function MagneticButton({ children, className = '', ...props }: any) {
  const ref = useRef<HTMLButtonElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'translate(0, 0)'
  }, [])

  return (
    <button ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      className={`magnetic-btn ${className}`} {...props}>
      {children}
    </button>
  )
}
