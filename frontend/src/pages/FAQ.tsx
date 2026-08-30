import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useSEO } from '../hooks/useSEO'

const FAQ_ITEMS = [
  { q: 'What is SarkariScout?', a: 'A government job aggregator. We pull notifications from 20+ official sites — SSC, UPSC, IBPS, RRB, state PSCs — and put them in one place. New job? We show it. Deadline changed? We update it. You search, filter, and track everything from a single dashboard.' },
  { q: 'Is it really free?', a: 'Yes. Browse jobs, set alerts, take mock tests, download papers, track applications — all free. We might add premium features later, but the core stuff stays free.' },
  { q: 'How do job alerts work?', a: 'Sign up, fill in your profile (education, state, category), and turn on email notifications. You get a daily digest of matching jobs plus instant alerts when deadlines are near.' },
  { q: 'Where does the data come from?', a: 'Directly from official government websites. We check multiple times a day for new notifications, date changes, corrigendum, and vacancy updates. No guessing, no copying from other sites.' },
  { q: 'How do I track applications?', a: 'Click "Track" on any job listing. Update the stage — Interest, Applied, Exam Prep, Exam Done, or Selected. Your dashboard shows everything with deadlines, and we notify you when things change.' },
  { q: 'How accurate is the info?', a: 'We pull straight from official sources and flag any changes we detect. But always double-check on the actual government website before applying. We\'re good, but we\'re not the final authority.' },
  { q: 'What about mock tests?', a: 'Tests designed around real exam patterns — SSC, UPSC, Banking, Railway, Engineering, and more. Timed sections, instant scoring, answer explanations. Practice like it\'s the real thing.' },
  { q: 'Are previous year papers free?', a: 'Yes. Download papers from official exams, organized by exam family, year, and qualification level.' },
  { q: 'What if the info is wrong?', a: 'Tell us. Use the Contact page or Report Bug feature. We review every report within 24 hours and fix what needs fixing.' },
  { q: 'Is my data safe?', a: 'We only collect what we need — name, email, preferences. We don\'t sell it, we don\'t share it, and it\'s stored on servers in India. You can delete your account and everything in it anytime.' },
  { q: 'Do you apply for jobs on my behalf?', a: 'No. We track things for you, but we never touch your email or interact with government portals for you. Always check the official site and your own email for the latest.' },
  { q: 'How do I delete my account?', a: 'Profile settings → Delete Account. Everything goes — tracked jobs, test history, preferences. It\'s permanent, so make sure you really want to.' },
]

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  useSEO({
    title: 'Frequently Asked Questions',
    description: 'Answers to common questions about SarkariScout — government job alerts, mock tests, papers, and tracking.',
    canonical: 'https://sarkariscout.in/faq',
    ogTitle: 'FAQ | SarkariScout',
    ogDescription: 'Frequently asked questions about SarkariScout.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        'name': item.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.a,
        },
      })),
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-600">Home</Link><span>/</span><span className="text-gray-900">FAQ</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-500 mb-8">The things people ask about most</p>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <span className="font-medium text-gray-900 dark:text-white pr-4">{item.q}</span>
                <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openIdx === i ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Still have questions?</h2>
          <p className="text-gray-500 mb-4">Drop us a line</p>
          <a href="mailto:sarkariscout+support@gmail.com"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Contact Support
          </a>
        </div>
      </main>
    </div>
  )
}
