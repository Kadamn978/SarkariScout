import { useState, useEffect, useCallback } from 'react'

interface Props {
  text: string
  className?: string
  trigger?: 'hover' | 'view'
  speed?: number
}

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export default function TextScramble({ text, className = '', trigger = 'hover', speed = 30 }: Props) {
  const [display, setDisplay] = useState(text)
  const [isScrambling, setIsScrambling] = useState(false)

  const scramble = useCallback(() => {
    if (isScrambling) return
    setIsScrambling(true)
    const chars = text.split('')
    const iterations = Math.ceil(text.length * 1.5)
    let frame = 0

    const interval = setInterval(() => {
      const progress = frame / iterations
      const result = chars.map((char, i) => {
        if (i < frame * (text.length / iterations)) return char
        if (char === ' ') return ' '
        return CHARS[Math.floor(Math.random() * CHARS.length)]
      }).join('')

      setDisplay(result)
      frame++

      if (frame > iterations) {
        clearInterval(interval)
        setDisplay(text)
        setIsScrambling(false)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, isScrambling])

  useEffect(() => {
    setDisplay(text)
  }, [text])

  if (trigger === 'hover') {
    return (
      <span
        className={`inline-block ${className}`}
        onMouseEnter={scramble}
      >
        {display}
      </span>
    )
  }

  return (
    <span className={`inline-block ${className}`}>
      {display}
    </span>
  )
}
