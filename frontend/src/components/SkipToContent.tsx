import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export default function SkipToContent() {
  const location = useLocation()

  // Close skip link on route change
  useEffect(() => {
    const el = document.getElementById('main-content')
    if (el) {
      el.focus({ preventScroll: false })
    }
  }, [location.pathname])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById('main-content')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      el.focus({ preventScroll: false })
    }
  }

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
    >
      Skip to main content
    </a>
  )
}