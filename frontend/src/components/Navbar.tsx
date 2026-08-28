import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import NotificationBell from './NotificationBell'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-black/5 border-gray-200/50 dark:border-gray-700/50'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
          Sarkari<span className="text-purple-600 dark:text-purple-400">Scout</span>
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-1">
          <NavLink to="/jobs">Jobs</NavLink>
          <NavLink to="/exam-calendar">Calendar</NavLink>
          <NavLink to="/results">Results</NavLink>
          <NavLink to="/mock-tests">Mock Tests</NavLink>
          <NavLink to="/papers">Papers</NavLink>
          <NavLink to="/faq">FAQ</NavLink>
          <NavLink to="/about">About</NavLink>
          {user ? (
            <>
              <NotificationBell />
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/progress">Progress</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
              <span className="text-sm text-gray-400 dark:text-gray-500 max-w-[100px] truncate">{user.name || user.email}</span>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link to="/register" className="ml-2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md shadow-blue-500/20">
                Register Free
              </Link>
            </>
          )}
          <button onClick={toggle} className="ml-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-base" aria-label="Toggle dark mode">
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="sm:hidden flex items-center gap-2">
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-base">
            {dark ? '☀️' : '🌙'}
          </button>
          <button
            className="p-2 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <Link to="/jobs" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Jobs</Link>
          <Link to="/exam-calendar" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Exam Calendar</Link>
          <Link to="/results" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Results</Link>
          <Link to="/admit-cards" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Admit Cards</Link>
          <Link to="/mock-tests" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Mock Tests</Link>
          <Link to="/papers" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Previous Papers</Link>
          <Link to="/faq" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>FAQ</Link>
          <Link to="/about" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>About</Link>
          <hr className="my-2 border-gray-100 dark:border-gray-800" />
          {user ? (
            <>
              <Link to="/dashboard" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/progress" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600" onClick={() => setMenuOpen(false)}>My Progress</Link>
              <Link to="/profile" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/email-preferences" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Email Settings</Link>
              {user.role === 'ADMIN' && <Link to="/admin" className="block py-2.5 text-purple-600 font-medium" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
              <hr className="my-2 border-gray-100 dark:border-gray-800" />
              <button onClick={() => { logout(); navigate('/login'); setMenuOpen(false) }} className="block py-2.5 text-red-600 font-medium">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="block py-2.5 text-blue-600 font-semibold" onClick={() => setMenuOpen(false)}>Register Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="relative px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200"
    >
      {children}
    </Link>
  )
}
