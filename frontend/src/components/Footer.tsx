import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">SarkariScout</h3>
            <p className="text-sm text-gray-400">Never miss a government job. Get personalized alerts for Sarkari Naukri.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Jobs</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="hover:text-white transition">All Jobs</Link></li>
              <li><Link to="/exam-calendar" className="hover:text-white transition">Exam Calendar</Link></li>
              <li><Link to="/results" className="hover:text-white transition">Results</Link></li>
              <li><Link to="/admit-cards" className="hover:text-white transition">Admit Cards</Link></li>
              <li><Link to="/mock-tests" className="hover:text-white transition">Mock Tests</Link></li>
              <li><Link to="/papers" className="hover:text-white transition">Previous Papers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition">About</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs?category=GOVERNMENT" className="hover:text-white transition">Government</Link></li>
              <li><Link to="/jobs?category=BANKING" className="hover:text-white transition">Banking</Link></li>
              <li><Link to="/jobs?category=RAILWAY" className="hover:text-white transition">Railway</Link></li>
              <li><Link to="/jobs?category=ENGINEERING" className="hover:text-white transition">Engineering</Link></li>
              <li><Link to="/jobs?category=DEFENCE" className="hover:text-white transition">Defence</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              <li><Link to="/profile" className="hover:text-white transition">Profile</Link></li>
              <li><Link to="/documents" className="hover:text-white transition">Documents</Link></li>
              <li><Link to="/email-preferences" className="hover:text-white transition">Email Settings</Link></li>
              <li><Link to="/bug-report" className="hover:text-white transition">Report Bug</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} SarkariScout. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <a href="mailto:support@sarakriradar.in" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
