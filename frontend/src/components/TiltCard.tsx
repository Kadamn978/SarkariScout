import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
  glareColor?: string
}

export default function TiltCard({ children, className = '', glareColor = 'rgba(255,255,255,0.15)' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 }
  const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), springConfig)
  const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), springConfig)
  const glareX = useSpring(useTransform(x, [0, 1], [0, 100]), springConfig)
  const glareY = useSpring(useTransform(y, [0, 1], [0, 100]), springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width)
    y.set((e.clientY - rect.top) / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0.5)
    y.set(0.5)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
    >
      {children}
      {/* Glare overlay */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, ${glareColor}, transparent 70%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />
    </motion.div>
  )
}
