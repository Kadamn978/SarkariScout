import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const FAQ_ITEMS = [
  { q: 'What is SarkariScout?', a: 'SarkariScout is a free platform that aggregates government job notifications from 20+ official sources like SSC, UPSC, IBPS, RRB and more. We filter, categorize, and send you personalized alerts so you never miss a deadline.' },
  { q: 'Is SarkariScout free to use?', a: 'Yes, absolutely free. Browse jobs, take mock tests, download previous year papers, and get email alerts — all at zero cost. We may introduce premium features later, but core features will always remain free.' },
  { q: 'How do I get job alerts?', a: 'Register for a free account, set your preferences (qualification, state, category), and enable email notifications. We will send you a daily digest of new jobs and instant alerts for tracked jobs.' },
  { q: 'How are jobs sourced?', a: 'Our crawlers monitor 20+ official sources including ssc.gov.in, upsc.gov.in, ibps.in, rrbcdg.gov.in, ncs.gov.in and more. We check for updates multiple times a day and notify you of changes.' },
  { q: 'Can I track my job applications?', a: 'Yes! Use the Application Tracker to mark jobs as Interested, Applied, Exam Prep, Exam Done, or Selected. View your dashboard to see stats and upcoming deadlines.' },
  { q: 'How do mock tests work?', a: 'Choose an exam family (SSC, UPSC, Banking etc.), pick a test, and attempt it within the time limit. After submission, you get instant scoring, correct answers, and a leaderboard ranking.' },
  { q: 'Are previous year papers free to download?', a: 'Yes. We provide direct links to official previous year question papers organized by exam family, year, and qualification level.' },
  { q: 'How accurate is the job information?', a: 'We pull data directly from official government websites. Any changes or corrigendum are detected by our crawlers and flagged in the job details so you always have the latest information.' },
  { q: 'Can I report incorrect information?', a: 'Absolutely. Use the Report Bug feature or email us at support@sarakriradar.in. We review all reports within 24 hours and correct any discrepancies.' },
  { q: 'Is my data safe?', a: 'Yes. We use industry-standard encryption, do not share your data with third parties, and you can delete your account anytime. Read our Privacy Policy for full details.' },
]

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-600">Home</Link><span>/</span><span className="text-gray-900">FAQ</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-500 mb-8">Everything you need to know about SarkariScout</p>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition">
                <span className="font-medium text-gray-900 pr-4">{item.q}</span>
                <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openIdx === i ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-blue-50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h2>
          <p className="text-gray-500 mb-4">We are here to help you</p>
          <a href="mailto:support@sarakriradar.in"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Contact Support
          </a>
        </div>
      </main>
    </div>
  )
}
