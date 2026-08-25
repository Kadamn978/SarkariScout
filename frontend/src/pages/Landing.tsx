import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

interface Job {
  id: string; title: string; org: string; state: string;
  totalVacancies: number | null; applyEnd: string | null;
  category: string; createdAt: string;
}

interface Stats {
  totalJobs: number; openJobs: number; expiringSoon: number;
}

const INDIAN_STATES = [
  'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Delhi', 'Karnataka',
  'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'West Bengal',
  'Andhra Pradesh', 'Telangana', 'Kerala', 'Punjab', 'Haryana',
]

const EXAM_FAMILIES = ['SSC', 'UPSC', 'Banking', 'Railway', 'Engineering', 'Defence', 'Police', 'Medical', 'Teaching', 'IT']

export default function Landing() {
  const { user } = useAuth()
  const [latestJobs, setLatestJobs] = useState<Job[]>([])
  const [expiringJobs, setExpiringJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [latestRes, expiringRes, statsRes] = await Promise.all([
        api.get('/jobs/recent?limit=8'),
        api.get('/jobs/upcoming?days=7'),
        api.get('/matching/stats'),
      ])
      setLatestJobs(latestRes.data)
      setExpiringJobs(expiringRes.data)
      setStats(statsRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function daysUntil(dateStr: string) {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
    return diff
  }

  const features = [
    { icon: '🔔', title: 'Personalized Alerts', desc: 'Get notified only for jobs you can apply to based on your education, state, and category.' },
    { icon: '🌐', title: '20+ Sources', desc: 'We monitor SSC, UPSC, Railways, IBPS, State PSCs and more — all in one place.' },
    { icon: '⏰', title: 'Never Miss Deadlines', desc: 'Email alerts before application deadlines close. Track exam dates, admit cards, results.' },
    { icon: '📝', title: 'Mock Tests', desc: 'Practice with subject-specific mock tests. Score yourself and track improvement over time.' },
    { icon: '📄', title: 'Previous Year Papers', desc: 'Download previous year question papers for SSC, UPSC, IBPS, RRB and more.' },
    { icon: '📋', title: 'Application Tracker', desc: 'Track your job applications from interest to selection. Never lose track of where you applied.' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl sm:text-2xl font-bold tracking-tight">SarkariScout</Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/jobs" className="px-3 py-2 text-sm hover:text-blue-200 hidden sm:inline">Jobs</Link>
            <Link to="/exam-calendar" className="px-3 py-2 text-sm hover:text-blue-200 hidden sm:inline">Calendar</Link>
            <Link to="/results" className="px-3 py-2 text-sm hover:text-blue-200 hidden sm:inline">Results</Link>
            <Link to="/admit-cards" className="px-3 py-2 text-sm hover:text-blue-200 hidden sm:inline">Admit Cards</Link>
            <Link to="/mock-tests" className="px-3 py-2 text-sm hover:text-blue-200 hidden sm:inline">Mock Tests</Link>
            <Link to="/papers" className="px-3 py-2 text-sm hover:text-blue-200 hidden sm:inline">Papers</Link>
            {user ? (
              <Link to="/dashboard" className="px-4 py-2 bg-white text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-50">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 border border-white/40 rounded-lg text-sm hover:bg-white/10">Login</Link>
                <Link to="/register" className="px-4 py-2 bg-white text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-50">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto text-center py-16 sm:py-24 px-4">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 leading-tight">Never Miss a Government Job</h1>
          <p className="text-base sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Get personalized alerts for Sarkari Naukri that match your education, state, and category.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link to="/register" className="px-8 py-3.5 bg-white text-blue-700 rounded-lg text-lg font-semibold hover:bg-blue-50 shadow-lg">
              Get Started Free
            </Link>
            <Link to="/jobs" className="px-8 py-3.5 border-2 border-white rounded-lg text-lg hover:bg-white/10">
              Browse {stats?.openJobs || 'All'} Jobs →
            </Link>
          </div>

          {stats && (
            <div className="flex justify-center gap-8 sm:gap-12 mt-10 sm:mt-14">
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold">{stats.openJobs}</p>
                <p className="text-sm text-blue-200">Open Jobs</p>
              </div>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold">15+</p>
                <p className="text-sm text-blue-200">Sources</p>
              </div>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold">11</p>
                <p className="text-sm text-blue-200">Mock Tests</p>
              </div>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold">{stats.expiringSoon}</p>
                <p className="text-sm text-blue-200">Expiring Soon</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Expiring Soon */}
      {!loading && expiringJobs.length > 0 && (
        <section className="bg-red-50 border-b border-red-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-red-800">⏰ Expiring Soon — Last Date Within 7 Days</h2>
              <Link to="/jobs" className="text-sm text-red-600 hover:text-red-700 font-medium">View All →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {expiringJobs.slice(0, 8).map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}
                  className="bg-white rounded-lg p-4 border border-red-100 hover:shadow-md transition">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{job.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{job.org}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${daysUntil(job.applyEnd!) <= 3 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {daysUntil(job.applyEnd!)} days left
                    </span>
                    {job.totalVacancies && <span className="text-xs text-gray-400">{job.totalVacancies} posts</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">Everything You Need</h2>
        <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">From job alerts to mock tests to application tracking — one platform for your entire government job preparation.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition border border-gray-100">
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Jobs */}
      {!loading && latestJobs.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Latest Government Jobs</h2>
                <p className="text-sm text-gray-500 mt-1">Recently added across all sources</p>
              </div>
              <Link to="/jobs" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All Jobs →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}
                  className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-lg hover:border-blue-200 transition group">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{job.category}</span>
                  <h3 className="font-semibold text-gray-900 mt-2 mb-1 line-clamp-2 group-hover:text-blue-600 transition">{job.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{job.org}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{job.state === 'ALL_IN' ? 'All India' : job.state}</span>
                    {job.applyEnd && <span>Due {new Date(job.applyEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Exam Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Browse by Exam Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {EXAM_FAMILIES.map((fam) => (
            <Link key={fam} to={`/jobs?search=${fam}`}
              className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-blue-300 hover:bg-blue-50 transition">
              <span className="font-semibold text-gray-800 text-sm">{fam}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* State-wise */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">State-wise Government Jobs</h2>
          <p className="text-gray-500 text-center mb-8 text-sm">Find jobs specific to your state</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/jobs" className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition">All India</Link>
            {INDIAN_STATES.map((state) => (
              <Link key={state} to={`/state/${state.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition">
                {state}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto text-center py-16 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Find Your Dream Government Job?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">Join thousands of aspirants who use SarkariScout to never miss a Sarkari Naukri opportunity.</p>
          <Link to="/register" className="px-8 py-3.5 bg-white text-blue-700 rounded-lg text-lg font-semibold hover:bg-blue-50 shadow-lg">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold mb-3">SarkariScout</h3>
              <p className="text-sm">Never miss a government job. Free alerts, mock tests, and papers.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3 text-sm">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/jobs" className="hover:text-white transition">All Jobs</Link></li>
                <li><Link to="/exam-calendar" className="hover:text-white transition">Exam Calendar</Link></li>
                <li><Link to="/results" className="hover:text-white transition">Results</Link></li>
                <li><Link to="/admit-cards" className="hover:text-white transition">Admit Cards</Link></li>
                <li><Link to="/mock-tests" className="hover:text-white transition">Mock Tests</Link></li>
                <li><Link to="/papers" className="hover:text-white transition">Previous Papers</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3 text-sm">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/jobs?category=GOVERNMENT" className="hover:text-white transition">Government</Link></li>
                <li><Link to="/jobs?category=BANKING" className="hover:text-white transition">Banking</Link></li>
                <li><Link to="/jobs?category=RAILWAY" className="hover:text-white transition">Railway</Link></li>
                <li><Link to="/jobs?category=ENGINEERING" className="hover:text-white transition">Engineering</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/bug-report" className="hover:text-white transition">Report Bug</Link></li>
                <li><a href="mailto:support@sarakriradar.in" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SarkariScout. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
