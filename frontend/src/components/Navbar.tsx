import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">SarkariScout</Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-4">
          <Link to="/jobs" className="text-sm text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">Jobs</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">Dashboard</Link>
              <Link to="/profile" className="text-sm text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">Profile</Link>
              <span className="text-sm text-gray-500">{user.name || user.email}</span>
              <button onClick={() => { logout(); navigate('/login') }} className="text-sm text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">Login</Link>
              <Link to="/register" className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Register</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t px-4 py-3 space-y-2 bg-white">
          <Link to="/jobs" className="block py-2 text-gray-600 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Jobs</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block py-2 text-gray-600 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/profile" className="block py-2 text-gray-600 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={() => { logout(); navigate('/login'); setMenuOpen(false) }} className="block py-2 text-red-600">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-gray-600 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="block py-2 text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
