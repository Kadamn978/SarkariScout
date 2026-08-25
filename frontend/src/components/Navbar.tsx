import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800" role="navigation" aria-label="Main navigation">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">SarkariScout</Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-4">
          <Link to="/jobs" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1">Jobs</Link>
          <Link to="/exam-calendar" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1">Calendar</Link>
          <Link to="/results" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1">Results</Link>
          <Link to="/admit-cards" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1">Admit Cards</Link>
          <Link to="/mock-tests" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1">Mock Tests</Link>
          <Link to="/papers" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1">Papers</Link>
          <Link to="/faq" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1">FAQ</Link>
          <Link to="/about" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1">About</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1">Dashboard</Link>
              <Link to="/profile" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1">Profile</Link>
              <span className="text-sm text-gray-300 dark:text-gray-600">|</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 max-w-[120px] truncate">{user.name || user.email}</span>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1">Login</Link>
              <Link to="/register" className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Register</Link>
            </>
          )}
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-base" aria-label="Toggle dark mode">
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
        <div className="sm:hidden border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-1 bg-white dark:bg-gray-900">
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
              <Link to="/profile" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/documents" className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Documents</Link>
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
