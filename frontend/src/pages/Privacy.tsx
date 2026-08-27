import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useSEO } from '../hooks/useSEO'

export default function Privacy() {
  useSEO({
    title: 'Privacy Policy',
    description: 'How SarkariScout handles your data. Short version: we don\'t sell it, we store it in India, and you can delete it anytime.',
    canonical: 'https://sarkariscout.in/privacy',
    ogTitle: 'Privacy Policy | SarkariScout',
    ogDescription: 'How SarkariScout handles your personal data.',
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link><span>/</span><span className="text-gray-900 dark:text-white">Privacy Policy</span>
        </nav>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
            <p className="text-gray-500 dark:text-gray-400">Last updated: August 2026</p>
          </div>

          <div className="p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. The short version</h2>
              <p>We don't sell your data. We don't share it with advertisers. We don't run creepy tracking scripts. We collect what we need to send you job alerts and make the site work, and that's it. Your data lives on servers in India, and you can delete everything anytime.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. What we collect</h2>
              <h3 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">Stuff you give us</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Name and email</strong> — when you sign up</li>
                <li><strong>Profile info</strong> — education, state, category, age (all optional, but helps us show you relevant jobs)</li>
                <li><strong>Job tracking data</strong> — the jobs you're following, your application status</li>
                <li><strong>Messages</strong> — anything you send us through contact forms or bug reports</li>
              </ul>

              <h3 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">Stuff we collect automatically</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Usage data</strong> — which pages you visit, what you search for, how you use the site</li>
                <li><strong>Device info</strong> — browser type, operating system, screen size</li>
                <li><strong>Log data</strong> — IP address, when you visited, where you came from</li>
              </ul>

              <h3 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">Cookies</h3>
              <p>We use cookies to keep you logged in and remember your preferences. That's it. Analytics and ad cookies only load if you say yes in the cookie banner. You can change your mind anytime.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. Why we collect it</h2>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>To run the site</strong> — job alerts, recommendations, tracking, mock tests</li>
                <li><strong>To keep in touch</strong> — deadline reminders, new job notifications, service updates (you can opt out)</li>
                <li><strong>To make it better</strong> — figuring out what's broken, what's slow, what people actually use</li>
                <li><strong>To keep it safe</strong> — catching abuse, fraud, and unauthorized access</li>
                <li><strong>Because the law says so</strong> — tax records, legal compliance, that kind of thing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4. Who we share it with</h2>
              <p>We don't sell your data. Period. Here's the only times we'd share anything:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Email providers</strong> — the companies that send our emails on our behalf (they can't use your data for anything else)</li>
                <li><strong>If the law makes us</strong> — court orders, government requests, that sort of thing</li>
                <li><strong>If we get bought</strong> — which isn't in the plans, but if it happens, you'll know before your data moves</li>
                <li><strong>Anonymous stats</strong> — things like "40% of users search for SSC jobs" — no way to trace it back to you</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">5. How we protect it</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>All data is encrypted in transit (HTTPS) and at rest</li>
                <li>Passwords are hashed with argon2id — we can't see them, even we can't</li>
                <li>We run security audits and fix vulnerabilities as we find them</li>
                <li>Access to user data is restricted to what's needed to run the service</li>
              </ul>
              <p className="mt-2">Is it perfect? No system is. But we take this seriously and do what makes sense for a project our size.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6. How long we keep it</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Account data</strong> — until you delete your account, then gone within 30 days</li>
                <li><strong>Usage logs</strong> — 90 days, then deleted</li>
                <li><strong>Job tracking data</strong> — as long as your account exists</li>
                <li><strong>Emails you send us</strong> — 12 months, so we have a support history</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">7. Your rights</h2>
              <p>You can:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Ask us what data we have on you</li>
                <li>Fix anything that's wrong</li>
                <li>Download your data</li>
                <li>Delete your account and all associated data</li>
                <li>Unsubscribe from emails (there's a link in every one)</li>
                <li>Withdraw consent for anything you previously agreed to</li>
              </ul>
              <p className="mt-2">Email <a href="mailto:privacy@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@sarkariscout.in</a> to exercise any of these. We'll respond within 30 days.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">8. Kids</h2>
              <p>SarkariScout isn't for anyone under 18. We don't knowingly collect data from minors. If we find out we have, we'll delete it immediately. Parents — if your kid somehow signed up, let us know and we'll handle it.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">9. India's DPDP Act 2023</h2>
              <p>We follow India's Digital Personal Data Protection Act. Here's what that means practically:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>We're the data fiduciary</strong> — that's legal-speak for "we're responsible for your data"</li>
                <li><strong>We only collect with your consent</strong> — you agreed when you signed up, and you can withdraw anytime</li>
                <li><strong>Purpose-limited</strong> — we only use your data for job alerts, matching, and running the site</li>
                <li><strong>Stored in India</strong> — your data never leaves the country</li>
                <li><strong>You can complain</strong> — email <a href="mailto:dpo@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">dpo@sarkariscout.in</a> if you have concerns. We'll respond within 30 days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">10. External links</h2>
              <p>Our site links to government websites and other external services. We're not responsible for what they do with your data. Check their privacy policies too.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">11. Changes to this policy</h2>
              <p>If we make significant changes, we'll let you know by email or a notice on the site. Keep using the site after changes go live and that means you're okay with them.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">12. Get in touch</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>General questions: <a href="mailto:privacy@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@sarkariscout.in</a></li>
                <li>Data protection officer: <a href="mailto:dpo@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">dpo@sarkariscout.in</a></li>
                <li>Other stuff: <a href="mailto:support@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">support@sarkariscout.in</a></li>
              </ul>
            </section>

          </div>
        </div>
      </main>
    </div>
  )
}
