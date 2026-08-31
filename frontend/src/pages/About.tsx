import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useSEO } from '../hooks/useSEO'

export default function About() {
  useSEO({
    title: 'About RozgarScout',
    description: 'RozgarScout aggregates government job notifications from 20+ official sources. Learn about our mission to help Indian aspirants never miss a deadline.',
    canonical: 'https://sarkariscout.in/about',
    ogTitle: 'About RozgarScout',
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">About RozgarScout</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Government job information in India is a mess. It's spread across 20+ websites — SSC, UPSC, IBPS, RRB, state PSCs — and every one of them updates on their own schedule. If you're a serious aspirant, you're probably checking three or four of these daily just to stay on top of things.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            RozgarScout fixes that. We pull notifications from all these sources into one place, filter by what matters to you, and let you know when deadlines are approaching or something changes. That way you can spend your time actually preparing instead of hunting for notifications.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What we actually do</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Job aggregation', desc: 'We monitor 20+ official sites multiple times a day. New notification? We catch it. Deadline extended? We catch that too.' },
              { title: 'Smart matching', desc: 'Set your qualification, state, category, and age. We show you jobs that actually fit — not a random list of 500 openings.' },
              { title: 'Email alerts', desc: 'Daily digest of new jobs plus instant alerts when deadlines are near. You set the preferences, we do the watching.' },
              { title: 'Application tracker', desc: 'Mark jobs as applied, track them through each stage, get notified when things change. Your entire job search in one dashboard.' },
              { title: 'Exam calendar', desc: 'All the dates — application deadlines, exam dates, admit cards, results — on a single timeline. No more spreadsheets.' },
              { title: 'Mock tests and papers', desc: 'Practice with tests that follow real exam patterns. Download previous year papers organized by exam and year.' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Where we get our data</h2>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Everything comes from official government websites — SSC, UPSC, IBPS, RRB, state PSCs, DRDO, ISRO, and others. We don't make up data, we don't guess, and we don't copy from other job sites. It's all sourced directly from official notifications.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Your data stays in India. All our servers are located domestically, in line with the DPDP Act 2023. We don't send your information outside the country.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Who we are</h2>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
               A small team that's been on the other side — as aspirants who spent too much time checking multiple websites for job notifications. We built RozgarScout because we wanted something better, and figured other people might want it too. It's still early days, but we're building this properly, one feature at a time.
            </p>
          </div>
        </section>

        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-2">Get started</h2>
          <p className="text-blue-100 mb-6">Free account. Personalized alerts. No spam.</p>
          <Link to="/register"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition">
            Create Free Account
          </Link>
        </div>
      </main>
    </div>
  )
}
