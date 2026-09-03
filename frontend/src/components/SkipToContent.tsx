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
      className="skip-to-content"
    >
      Skip to main content
    </a>
  )
}