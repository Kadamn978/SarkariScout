import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Landing() {
  const { user } = useAuth()

  const features = [
    { title: 'Personalized Alerts', desc: 'Get notified only for jobs you can apply to based on your education, state, and category.' },
    { title: '20+ Sources', desc: 'We monitor SSC, UPSC, Railways, IBPS, State PSCs and more — all in one place.' },
    { title: 'Never Miss Deadlines', desc: 'Email alerts before application deadlines close. Track exam dates, admit cards, results.' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <nav className="flex justify-between items-center max-w-6xl mx-auto px-4 sm:px-6 py-4" role="navigation" aria-label="Main">
        <span className="text-xl sm:text-2xl font-bold">SarkariScout</span>
        <div className="flex gap-3">
          {user ? (
            <Link to="/dashboard" className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 border border-white rounded-lg text-sm hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-white">Login</Link>
              <Link to="/register" className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white">Register</Link>
            </>
          )}
        </div>
      </nav>

      <header className="max-w-4xl mx-auto text-center py-16 sm:py-24 px-4">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 leading-tight">Never Miss a Government Job</h1>
        <p className="text-base sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">Get personalized alerts for Sarkari Naukri that match your education, state, and category.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link to="/register" className="px-6 sm:px-8 py-3 bg-white text-blue-600 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white">Get Started Free</Link>
          <Link to="/jobs" className="px-6 sm:px-8 py-3 border border-white rounded-lg text-base sm:text-lg hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-white">Browse Jobs</Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24" aria-label="Features">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-2">{f.title}</h2>
              <p className="text-blue-100 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
