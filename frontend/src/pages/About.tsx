import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useSEO } from '../hooks/useSEO'

export default function About() {
  useSEO({
    title: 'About SarkariScout',
    description: 'SarkariScout aggregates government job notifications from 20+ official sources. Learn about our mission to help Indian aspirants never miss a deadline.',
    canonical: 'https://sarkariscout.in/about',
    ogTitle: 'About SarkariScout',
    ogDescription: 'Government job aggregator monitoring 20+ official sources. Free alerts, mock tests, and papers.',
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-600">Home</Link><span>/</span><span className="text-gray-900 dark:text-white">About</span>
        </nav>

        <section className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">About SarkariScout</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            SarkariScout is a government job notification aggregator built for Indian aspirants. We monitor 20+ official government portals — including SSC, UPSC, IBPS, RRB, and state PSCs — to bring you real-time updates on new notifications, deadline changes, and exam schedules.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Our platform is designed to solve a real problem: government job information in India is scattered across dozens of websites, and it is easy to miss a deadline. SarkariScout consolidates these sources into a single, searchable dashboard so you can focus on preparation instead of hunting for notifications.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What We Offer</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Job Aggregation', desc: '20+ official sources monitored multiple times daily. Notifications, corrigendum, and deadline changes — all captured automatically.' },
              { title: 'Smart Matching', desc: 'Filter jobs by qualification, state, age, and category. See only the opportunities that match your profile.' },
              { title: 'Email Alerts', desc: 'Daily digest of new jobs plus instant alerts before deadlines. Never miss an application window.' },
              { title: 'Application Tracker', desc: 'Track jobs from interest to selection. Get notified of status changes and deadline updates for your tracked applications.' },
              { title: 'Exam Calendar', desc: 'All important dates — application deadlines, exam dates, admit cards, and results — on a single timeline.' },
              { title: 'Mock Tests & Papers', desc: 'Practice with exam-pattern tests and download previous year question papers organized by exam family and year.' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Sources</h2>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400 mb-4">We aggregate data from official government portals including SSC, UPSC, IBPS, RRB, state PSCs, DRDO, ISRO, and more. All data is sourced from publicly available government websites and official notifications.</p>
            <p className="text-gray-600 dark:text-gray-400">Our servers are located in India, and all user data is stored domestically in compliance with the Digital Personal Data Protection Act 2023.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Approach</h2>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              SarkariScout is built and maintained by a small team of developers who understand the challenges faced by government job aspirants. We believe that access to timely, accurate job notifications should not depend on manually checking multiple websites every day. Our platform automates this process and presents the information in a clean, organized format.
            </p>
          </div>
        </section>

        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-2">Get Started</h2>
          <p className="text-blue-100 mb-6">Create a free account to set up personalized job alerts and start tracking applications.</p>
          <Link to="/register"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition">
            Create Free Account
          </Link>
        </div>
      </main>
    </div>
  )
}
