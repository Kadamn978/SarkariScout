import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'

export default function Footer() {
  const { user } = useAuth()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className={`grid grid-cols-2 gap-8 ${user ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
          <div>
            <h3 className="text-white font-semibold mb-4">SarkariScout</h3>
            <p className="text-sm text-gray-400">Never miss a government job. Get personalized alerts for Sarkari Naukri.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Jobs</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" onClick={scrollToTop} className="hover:text-white transition">All Jobs</Link></li>
              <li><Link to="/exam-calendar" onClick={scrollToTop} className="hover:text-white transition">Exam Calendar</Link></li>
              <li><Link to="/results" onClick={scrollToTop} className="hover:text-white transition">Results</Link></li>
              <li><Link to="/admit-cards" onClick={scrollToTop} className="hover:text-white transition">Admit Cards</Link></li>
              <li><Link to="/mock-tests" onClick={scrollToTop} className="hover:text-white transition">Mock Tests</Link></li>
              <li><Link to="/papers" onClick={scrollToTop} className="hover:text-white transition">Previous Papers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" onClick={scrollToTop} className="hover:text-white transition">About</Link></li>
              <li><Link to="/faq" onClick={scrollToTop} className="hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs?category=GOVERNMENT" onClick={scrollToTop} className="hover:text-white transition">Government</Link></li>
              <li><Link to="/jobs?category=BANKING" onClick={scrollToTop} className="hover:text-white transition">Banking</Link></li>
              <li><Link to="/jobs?category=RAILWAY" onClick={scrollToTop} className="hover:text-white transition">Railway</Link></li>
              <li><Link to="/jobs?category=ENGINEERING" onClick={scrollToTop} className="hover:text-white transition">Engineering</Link></li>
              <li><Link to="/jobs?category=DEFENCE" onClick={scrollToTop} className="hover:text-white transition">Defence</Link></li>
            </ul>
          </div>
          {user && (
            <div>
              <h4 className="text-white font-medium mb-3 text-sm">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/dashboard" onClick={scrollToTop} className="hover:text-white transition">Dashboard</Link></li>
                <li><Link to="/profile" onClick={scrollToTop} className="hover:text-white transition">Profile</Link></li>
                <li><Link to="/documents" onClick={scrollToTop} className="hover:text-white transition">Documents</Link></li>
                <li><Link to="/email-preferences" onClick={scrollToTop} className="hover:text-white transition">Email Settings</Link></li>
                <li><Link to="/bug-report" onClick={scrollToTop} className="hover:text-white transition">Report Bug</Link></li>
              </ul>
            </div>
          )}
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} SarkariScout. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/privacy" onClick={scrollToTop} className="hover:text-white transition">Privacy</Link>
            <Link to="/terms" onClick={scrollToTop} className="hover:text-white transition">Terms</Link>
            <Link to="/contact" onClick={scrollToTop} className="hover:text-white transition">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
