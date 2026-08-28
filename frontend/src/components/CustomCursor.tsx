import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)
  const [text, setText] = useState(false)

  useEffect(() => {
    const cursor = cursorRef.current
    const dot = dotRef.current
    if (!cursor || !dot) return

    let mouseX = 0, mouseY = 0
    let cursorX = 0, cursorY = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`
    }

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.12
      cursorY += (mouseY - cursorY) * 0.12
      cursor.style.transform = `translate(${cursorX - 16}px, ${cursorY - 16}px)`
      requestAnimationFrame(animate)
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive = target.closest('a, button, [role="button"], input, textarea, select, label')
      const isText = target.closest('h1, h2, h3, h4, h5, h6, p, span')
      setHovering(!!isInteractive)
      setText(!!isText && !isInteractive)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)
    requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border-2 pointer-events-none z-[9999] mix-blend-difference hidden lg:block transition-[width,height,border-color] duration-200 ${
          hovering
            ? 'w-12 h-12 border-blue-400 bg-blue-400/10'
            : text
            ? 'w-6 h-6 border-purple-400 bg-purple-400/10'
            : 'border-white bg-white/5'
        }`}
      />
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-white pointer-events-none z-[9999] hidden lg:block"
      />
    </>
  )
}
