import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useSEO } from '../hooks/useSEO'

export default function Terms() {
  useSEO({
    title: 'Terms of Service',
    description: 'The rules for using SarkariScout. Plain language, no nonsense.',
    canonical: 'https://sarkariscout.in/terms',
    ogTitle: 'Terms of Service | SarkariScout',
    ogDescription: 'Terms for using SarkariScout.',
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link><span>/</span><span className="text-gray-900 dark:text-white">Terms of Service</span>
        </nav>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
            <p className="text-gray-500 dark:text-gray-400">Last updated: August 2026</p>
          </div>

          <div className="p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. The deal</h2>
              <p>Use SarkariScout and you're agreeing to these terms. Don't use it if you don't agree — that's fair. We can update these terms whenever we need to, and if you keep using the site after we do, that counts as accepting the changes.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. What SarkariScout actually does</h2>
              <p>We're a government job notification aggregator. We pull data from official sources — SSC, UPSC, IBPS, RRB, state PSCs, and others — and put it all in one place so you don't have to check twenty different websites every morning.</p>
              <p className="mt-2">Here's what you get:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Job notifications from official government portals, updated automatically</li>
                <li>Email alerts when new jobs match your profile or deadlines are coming up</li>
                <li>A tracker to manage your applications from first interest to final result</li>
                <li>Mock tests that follow real exam patterns</li>
                <li>Previous year papers you can download and practice with</li>
                <li>An exam calendar with all the important dates in one view</li>
              </ul>
              <p className="mt-2">One thing we need to be upfront about: we're not the official source for any of this. We pull from official sites, but <strong>you should always double-check details on the actual government website before you apply</strong>. We can't guarantee every last detail is perfect — we're good, but we're not infallible.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. Who can use this</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>You need to be <strong>at least 18</strong>.</li>
                <li>You need to be legally able to enter a contract under Indian law.</li>
                <li>Under-18s can use the site, but only with a parent or guardian who's okay with these terms.</li>
                <li>Don't lie about who you are during signup.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4. Your account</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>One account per person.</strong> If we find duplicates, we'll merge or remove them.</li>
                <li><strong>Keep your info accurate.</strong> If your email or education changes, update your profile.</li>
                <li><strong>Guard your password.</strong> Anything that happens under your account is on you.</li>
                <li><strong>Don't share your account.</strong> It's yours, not a family plan.</li>
                <li><strong>Email settings are your call.</strong> If you turn off notifications and miss a deadline, that's not on us.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">5. What not to do</h2>
              <p>Basically, don't be a jerk:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>No spamming, flooding the site with requests, or running bots without permission.</li>
                <li>No harassing other users.</li>
                <li>No scraping our content or running automated crawlers on the site.</li>
                <li>No using the site for anything illegal under Indian law.</li>
                <li>No pretending to be someone you're not.</li>
                <li>No uploading anything offensive, defamatory, or harmful.</li>
                <li>No trying to break or hack the site.</li>
              </ul>
              <p className="mt-2">Break these rules and we'll suspend or ban your account. No warnings needed.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6. Who owns what</h2>
              <p>The job listings, notifications, and exam data come from government websites. That's public information — nobody owns it, and you're free to access it.</p>
              <p className="mt-2">The site itself — the code, the design, the logo, the features — that's ours. You can't copy, modify, or redistribute any of it without written permission.</p>
              <p className="mt-2">If you leave notes, feedback, or suggestions on the site, we can use them to improve things. That's the deal.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">7. No guarantees</h2>
              <p>SarkariScout runs on a "best efforts" basis. We work hard to keep things accurate and running, but we can't promise perfection.</p>
              <p className="mt-2">Specifically, we don't guarantee:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>That every job posting is 100% accurate or up to the minute</li>
                <li>That the site will never go down or have bugs</li>
                <li>That your data is unhackable (no site can promise that)</li>
                <li>That the site will be perfect for whatever specific thing you need it for</li>
              </ul>
              <p className="mt-2"><strong>This is important:</strong> We're not the official source. We don't run exams, we don't process applications, we don't make hiring decisions. We just aggregate information. If you miss a deadline because you relied on our data instead of checking the official site, that's on you, not us. Always verify before you apply.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">8. Our liability has limits</h2>
              <p>To the extent the law allows, SarkariScout won't be responsible for:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Wrong or missing info in job postings</li>
                <li>Missed deadlines because you relied on our data</li>
                <li>Any indirect or consequential damages</li>
                <li>What government agencies or exam bodies do (or don't do)</li>
                <li>The site going down for maintenance or technical issues</li>
              </ul>
              <p className="mt-2">Our total liability, if any, caps at ₹100 or what you paid us in the last year — whichever is higher. Since the site is free, that basically means ₹100.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">9. You've got our back too</h2>
              <p>If someone sues us because of something you did on the site — breaking these terms, uploading bad content, infringing someone's rights — you agree to cover our legal costs. That's just fair.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">10. Deleting your account</h2>
              <p>You can delete your account anytime from your Profile page or by emailing us. Once deleted:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Your data goes away within 30 days</li>
                <li>Email subscriptions stop immediately</li>
                <li>You lose all your tracked jobs and preferences</li>
              </ul>
              <p className="mt-2">We can also delete your account if you break the rules. We don't need to give advance notice for that.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">11. Disputes</h2>
              <p>These terms follow <strong>Indian law</strong>. If there's a dispute, it goes to the courts in India — no exceptions.</p>
              <p className="mt-2">Before lawyering up, though, try talking to us first. Email <a href="mailto:support@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">support@sarkariscout.in</a> and give us 30 days to work it out. Most things don't need a courtroom.</p>
              <p className="mt-2">Also, no class-action lawsuits. Any dispute is between you and us, individually.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">12. Questions?</h2>
              <p>Reach out to us at <a href="mailto:support@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">support@sarkariscout.in</a>. We usually get back within a week.</p>
            </section>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-8">
              <p className="text-xs text-gray-500 dark:text-gray-400">By using SarkariScout, you've read these terms, understood them, and agreed to follow them. If you don't agree, don't use the site.</p>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
