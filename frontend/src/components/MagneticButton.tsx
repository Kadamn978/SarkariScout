import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
  strength?: number
}

export default function MagneticButton({ children, className = '', strength = 0.3 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 })
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 })

  const scale = useTransform(
    [springX, springY],
    ([latestX, latestY]: number[]) => {
      const distance = Math.sqrt(latestX * latestX + latestY * latestY)
      return 1 + distance * 0.001
    }
  )

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * strength)
    y.set((e.clientY - centerY) * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY, scale }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
      className={`inline-block cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  )
}
