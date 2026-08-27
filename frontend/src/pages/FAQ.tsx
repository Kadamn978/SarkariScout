import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useSEO } from '../hooks/useSEO'

const FAQ_ITEMS = [
  { q: 'What is SarkariScout?', a: 'SarkariScout is a government job notification aggregator for Indian aspirants. We monitor 20+ official government portals — including SSC, UPSC, IBPS, RRB, state PSCs, and more — and consolidate job notifications, deadline changes, and exam schedules into a single searchable platform. Our goal is to ensure you never miss a Sarkari Naukri opportunity.' },
  { q: 'Is SarkariScout free?', a: 'Yes. All core features — browsing jobs, setting up alerts, taking mock tests, downloading previous year papers, and tracking applications — are completely free. We may introduce optional premium features in the future, but core functionality will remain free.' },
  { q: 'How do I set up job alerts?', a: 'Register for a free account, complete your profile with education, state, and category preferences, and enable email notifications. You will receive a daily digest of new jobs matching your profile, plus instant alerts for tracked jobs approaching their deadline.' },
  { q: 'Where does the job data come from?', a: 'We pull data directly from official government websites. Our system checks these sources multiple times a day for new notifications, corrigendum, date extensions, and vacancy changes. All data is sourced from publicly available government portals.' },
  { q: 'How do I track my applications?', a: 'Navigate to any job listing and click "Track." You can update the stage — Interest, Applied, Exam Prep, Exam Done, or Selected. Your dashboard displays all tracked jobs with deadlines, and you receive notifications when deadlines change or updates are posted.' },
  { q: 'How accurate is the information?', a: 'We pull data directly from official sources and detect changes automatically. Any modifications or corrigendum are flagged in the job details. However, we always recommend verifying all details on the official government website before applying.' },
  { q: 'What do the mock tests include?', a: 'Mock tests are designed to match real exam patterns for SSC, UPSC, Banking, Railway, Engineering, and other exam families. Each test includes timed sections, instant scoring, answer explanations, and performance tracking.' },
  { q: 'Are previous year papers free?', a: 'Yes. We provide access to previous year question papers sourced from official examinations, organized by exam family, year, and qualification level.' },
  { q: 'How do I report incorrect information?', a: 'Use the Contact Us page or the Report Bug feature. All reports are reviewed within 24 hours, and corrections are made promptly. Accuracy is a priority for us.' },
  { q: 'Is my data safe?', a: 'We collect only the information necessary to provide our services — name, email, and preferences. We do not sell or share personal data with third parties. All data is stored on servers within India in compliance with the DPDP Act 2023. You can delete your account and all associated data at any time.' },
  { q: 'Do you check official mail or application status on my behalf?', a: 'No. We provide a centralized place to track your applications, but we do not access your email or interact with government portals on your behalf. Always check the official website and your registered email for the most current information.' },
  { q: 'How do I delete my account?', a: 'Go to your Profile settings and select "Delete Account." This will permanently remove all your data, including tracked jobs, test history, and preferences. This action cannot be undone.' },
]

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  useSEO({
    title: 'Frequently Asked Questions',
    description: 'Get answers to common questions about SarkariScout — free government job alerts, mock tests, previous papers, and application tracker.',
    canonical: 'https://sarkariscout.in/faq',
    ogTitle: 'FAQ | SarkariScout',
    ogDescription: 'Frequently asked questions about SarkariScout government job portal.',
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
        <p className="text-gray-500 mb-8">Common questions about using SarkariScout</p>

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
          <p className="text-gray-500 mb-4">We are here to help you</p>
          <a href="mailto:support@sarkariscout.in"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Contact Support
          </a>
        </div>
      </main>
    </div>
  )
}
