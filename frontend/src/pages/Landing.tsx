import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <nav className="flex justify-between items-center max-w-6xl mx-auto px-6 py-4">
        <span className="text-2xl font-bold">SarkariRadar</span>
        <div className="flex gap-4">
          {user ? (
            <Link to="/dashboard" className="px-4 py-2 bg-white text-blue-600 rounded-lg">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-blue-600">Login</Link>
              <Link to="/register" className="px-4 py-2 bg-white text-blue-600 rounded-lg">Register</Link>
            </>
          )}
        </div>
      </nav>
      <div className="max-w-4xl mx-auto text-center py-24 px-6">
        <h1 className="text-5xl font-bold mb-6">Never Miss a Government Job</h1>
        <p className="text-xl text-blue-100 mb-8">Get personalized alerts for Sarkari Naukri that match your education, state, and category.</p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="px-8 py-3 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50">Get Started Free</Link>
          <Link to="/jobs" className="px-8 py-3 border border-white rounded-lg text-lg hover:bg-white hover:text-blue-600">Browse Jobs</Link>
        </div>
      </div>
    </div>
  )
}
