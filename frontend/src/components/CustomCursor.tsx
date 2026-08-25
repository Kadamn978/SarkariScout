import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)

  useEffect(() => {
    const cursor = cursorRef.current
    const dot = dotRef.current
    if (!cursor || !dot) return

    let mx = 0, my = 0, cx = 0, cy = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      dot.style.left = mx + 'px'
      dot.style.top = my + 'px'
    }

    const animate = () => {
      cx += (mx - cx) * 0.12
      cy += (my - cy) * 0.12
      cursor.style.left = cx + 'px'
      cursor.style.top = cy + 'px'
      requestAnimationFrame(animate)
    }

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [role="button"], input, select, textarea, label')) setHovering(true)
    }
    const onOut = () => setHovering(false)
    const onDown = () => setClicking(true)
    const onUp = () => setClicking(false)

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    animate()

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  return (
    <>
      <div ref={cursorRef}
        className={`hidden lg:block fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-500/60 transition-[width,height,border-color,background] duration-300 ease-out ${hovering ? 'w-12 h-12 border-blue-400 bg-blue-500/10' : clicking ? 'w-8 h-8 border-blue-300 bg-blue-500/20' : 'w-8 h-8'}`} />
      <div ref={dotRef}
        className="hidden lg:block fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
    </>
  )
}
