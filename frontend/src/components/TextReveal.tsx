import { useEffect, useRef, useState } from 'react'

interface Props {
  children: string
  className?: string
  tag?: 'h1' | 'h2' | 'h3' | 'p'
  delay?: number
  speed?: number
}

export default function TextReveal({ children, className = '', tag: Tag = 'h2', delay = 0, speed = 40 }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const words = children.split(' ')

  return (
    // @ts-ignore
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
          <span
            className="inline-block transition-all ease-out"
            style={{
              transitionDuration: '600ms',
              transitionDelay: `${delay + i * speed}ms`,
              transform: visible ? 'translateY(0)' : 'translateY(100%)',
              opacity: visible ? 1 : 0,
            }}>
            {word}
          </span>
        </span>
      ))}
    </Tag>
  )
}
