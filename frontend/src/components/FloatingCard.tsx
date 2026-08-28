import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
  rotateIntensity?: number
  glareIntensity?: number
}

export default function FloatingCard({
  children,
  className = '',
  rotateIntensity = 15,
  glareIntensity = 0.2,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const springConfig = { stiffness: 100, damping: 20, mass: 0.5 }
  const rotateX = useSpring(useTransform(y, [0, 1], [rotateIntensity, -rotateIntensity]), springConfig)
  const rotateY = useSpring(useTransform(x, [0, 1], [-rotateIntensity, rotateIntensity]), springConfig)
  const scale = useSpring(isHovered ? 1.05 : 1, springConfig)
  const z = useSpring(isHovered ? 50 : 0, springConfig)

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

  const glareX = useTransform(x, [0, 1], [0, 100])
  const glareY = useTransform(y, [0, 1], [0, 100])

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        rotateY,
        scale,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
    >
      {/* 3D depth shadow */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] bg-blue-500/10 blur-xl"
        style={{ z, translateZ: -50 }}
      />

      {/* Content */}
      <div style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>

      {/* Glare effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255,255,255,${glareIntensity}), transparent 70%)`,
          }}
        />
      )}
    </motion.div>
  )
}
