import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import NotificationBell from './NotificationBell'
import Logo from './Logo'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    setCanGoBack(window.history.length > 1)
  }, [location])

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

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
        <div className="flex items-center gap-2">
          {canGoBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-400"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Logo size={28} />
            <span className="text-blue-600 dark:text-blue-400">Naukar<span className="text-purple-600 dark:text-purple-400">Scout</span></span>
          </Link>
        </div>

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
          <button onClick={toggle} className="ml-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" aria-label="Toggle dark mode">
            {dark ? (
              <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="sm:hidden flex items-center gap-2">
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" aria-label="Toggle dark mode">
            {dark ? (
              <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
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
