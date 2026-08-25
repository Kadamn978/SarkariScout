import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const STATS = [
  { value: '20+', label: 'Official Sources' },
  { value: '10K+', label: 'Jobs Tracked' },
  { value: '50K+', label: 'Users Served' },
  { value: '24/7', label: 'Monitoring' },
]

const TEAM = [
  { role: 'Crawler Engineer', desc: 'Builds and maintains scrapers for 20+ government websites, ensuring data accuracy and freshness.' },
  { role: 'Data Analyst', desc: 'Structures and validates job data, cross-references notifications, and flags inconsistencies.' },
  { role: 'Product Designer', desc: 'Designs the user experience for job discovery, application tracking, and exam preparation.' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-600">Home</Link><span>/</span><span className="text-gray-900">About</span>
        </nav>

        <section className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">About SarkariScout</h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            SarkariScout was built to solve a simple problem: government job information in India is scattered across 20+ websites, and deadlines are easy to miss.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We aggregate notifications from SSC, UPSC, IBPS, RRB, state PSCs, and more — into a single, searchable dashboard. Our crawlers monitor these sites multiple times a day, so you get real-time updates without checking each site manually.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Job Aggregation', desc: '20+ official sources crawled multiple times daily. Never miss a notification.' },
              { title: 'Smart Matching', desc: 'Jobs filtered by your qualification, state, age, and category. See only what is relevant.' },
              { title: 'Email Alerts', desc: 'Daily digest and instant alerts before deadlines. Track jobs and get notified of changes.' },
              { title: 'Application Tracker', desc: 'Mark jobs as applied, track stages, and see your progress on a personal dashboard.' },
              { title: 'Mock Tests', desc: 'Practice with exam-pattern tests for SSC, UPSC, Banking, Railway and more.' },
              { title: 'Previous Papers', desc: 'Download previous year question papers organized by exam family and year.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Numbers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <div key={i} className="text-center p-6 bg-white rounded-xl border border-gray-100">
                <p className="text-3xl font-bold text-blue-600">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Sources</h2>
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <p className="text-gray-600 mb-4">We aggregate data from official government portals:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {['SSC (ssc.gov.in)', 'UPSC (upsc.gov.in)', 'IBPS (ibps.in)', 'RRB (rrb.gov.in)', 'NCS (ncs.gov.in)', 'State PSCs', 'Defence (indianarmy.nic.in)', 'CRPF (crpf.gov.in)', 'DRDO (drdo.gov.in)', 'AIIMS (aiimsexams.ac.in)', 'GATE (gate.iitd.ac.in)', 'CTET (ctet.nic.in)'].map((s, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                  <span className="text-gray-700">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Built with AI Agents</h2>
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <p className="text-gray-600 mb-4">SarkariScout uses a multi-agent architecture:</p>
            <div className="space-y-3">
              {TEAM.map((t, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{t.role}</p>
                    <p className="text-sm text-gray-600">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-2">Ready to start?</h2>
          <p className="text-blue-100 mb-6">Join thousands of government job aspirants who never miss a deadline.</p>
          <Link to="/register"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition">
            Create Free Account
          </Link>
        </div>
      </main>
    </div>
  )
}
