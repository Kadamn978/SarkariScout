import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useSEO } from '../hooks/useSEO'

export default function Terms() {
  useSEO({
    title: 'Terms of Service',
    description: 'SarkariScout Terms of Service. Read the terms and conditions governing your use of our government job aggregation platform, alerts, mock tests, and career tools.',
    canonical: 'https://sarkariscout.in/terms',
    ogTitle: 'Terms of Service | SarkariScout',
    ogDescription: 'Terms and conditions for using SarkariScout — the government job notification aggregator for Indian aspirants.',
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Agreement to Terms</h2>
              <p>By accessing or using the SarkariScout platform ("Platform"), including our website at sarkariscout.in and all related services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not access or use the Platform.</p>
              <p className="mt-2">These Terms constitute a legally binding agreement between you ("User," "you," or "your") and SarkariScout ("we," "our," or "us"). We reserve the right to modify these Terms at any time. Continued use of the Platform after modifications are posted constitutes acceptance of the revised Terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Description of Service</h2>
              <p>SarkariScout is a free government job notification aggregator designed for Indian aspirants. The Platform provides the following services:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Job Aggregation:</strong> Collection and organization of government job notifications from official sources including SSC, UPSC, state PSCs, railways, banking, and other public sector organizations.</li>
                <li><strong>Smart Alerts:</strong> Email and push notifications for new job postings matching your eligibility criteria, education level, and preferences.</li>
                <li><strong>Job Tracker:</strong> Application tracking tool to manage deadlines, track application status, and organize your job search workflow.</li>
                <li><strong>Mock Tests:</strong> Practice examinations and quizzes to help you prepare for competitive government exams.</li>
                <li><strong>Papers &amp; Solutions:</strong> Access to previous year question papers, answer keys, and detailed solutions for exam preparation.</li>
                <li><strong>Exam Calendar:</strong> Comprehensive calendar of upcoming government exam dates, admit card releases, and result declarations.</li>
              </ul>
              <p className="mt-2">We strive to provide accurate and timely information but do not guarantee the completeness or accuracy of aggregated data. <strong>Always verify all details on the official government website before applying.</strong></p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. Eligibility</h2>
              <p>To use the Platform, you must meet the following eligibility requirements:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>You must be <strong>at least 18 years of age</strong> at the time of registration.</li>
                <li>You must have the legal capacity to enter into a binding agreement under Indian law.</li>
                <li>You must not be barred from using the Platform under any applicable law.</li>
                <li>You must provide truthful and accurate information during registration and throughout your use of the Platform.</li>
              </ul>
              <p className="mt-2">If you are under 18, you may only use the Platform with the consent and supervision of a parent or legal guardian who agrees to be bound by these Terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4. User Accounts</h2>
              <p>Certain features of the Platform require you to create an account. By creating an account, you agree to the following:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>One Account Per Person:</strong> Each individual is permitted to maintain only one (1) active account. Duplicate accounts will be merged or suspended at our discretion.</li>
                <li><strong>Accurate Information:</strong> You must provide complete, accurate, and current information during registration and keep your profile information up to date at all times.</li>
                <li><strong>Account Security:</strong> You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use.</li>
                <li><strong>No Account Sharing:</strong> Your account is personal to you. You may not transfer, sell, or share your account credentials with any third party.</li>
                <li><strong>Notification Preferences:</strong> You are responsible for managing your email notification settings. Opting out of notifications does not relieve you of your obligation to check official sources for important updates.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">5. Acceptable Use</h2>
              <p>You agree to use the Platform only for lawful purposes and in accordance with these Terms. You must not:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>No Spam or Abuse:</strong> Send unsolicited communications, flood the Platform with requests, or use automated tools to interact with the Platform without our written consent.</li>
                <li><strong>No Harassment:</strong> Harass, threaten, intimidate, or cause distress to any other user or individual through the Platform.</li>
                <li><strong>No Scraping or Automated Access:</strong> Use bots, crawlers, scrapers, or other automated means to access or collect data from the Platform without explicit written authorization.</li>
                <li><strong>No Illegal Activity:</strong> Use the Platform for any purpose that violates applicable Indian laws, regulations, or government policies.</li>
                <li><strong>No Impersonation:</strong> Impersonate any person or entity, or falsely claim affiliation with any person or entity.</li>
                <li><strong>No Harmful Content:</strong> Upload or transmit content that is defamatory, obscene, abusive, invasive of privacy, or otherwise objectionable.</li>
                <li><strong>No Interference:</strong> Attempt to interfere with, compromise the integrity of, or disrupt the Platform or its servers and networks.</li>
              </ul>
              <p className="mt-2">We reserve the right to investigate and take appropriate action against any user who violates this section, including suspension or permanent termination of their account.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6. Intellectual Property</h2>
              <h3 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">6.1 Government Data</h3>
              <p>Job postings, notifications, exam schedules, and related information displayed on the Platform are sourced from official government websites and public domain data. Such information is not subject to copyright restrictions and may be freely accessed by the public.</p>
              <h3 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">6.2 Platform Content</h3>
              <p>All content, design, code, graphics, logos, trademarks, and other proprietary elements of the Platform are the exclusive property of SarkariScout and are protected by applicable intellectual property laws, including the Copyright Act, 1957 and the Trade Marks Act, 1999. You may not reproduce, distribute, modify, or create derivative works without our express written permission.</p>
              <h3 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">6.3 User Content</h3>
              <p>By submitting content to the Platform (including notes, feedback, and suggestions), you grant SarkariScout a non-exclusive, royalty-free, perpetual license to use, modify, and display such content for the purpose of operating and improving the Platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">7. Disclaimer of Warranties</h2>
              <p>The Platform is provided on an <strong>"as is"</strong> and <strong>"best efforts"</strong> basis. While we make every reasonable effort to ensure accuracy and timeliness, we make no warranties or representations regarding:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>The <strong>accuracy, completeness, or reliability</strong> of job postings, exam dates, or other information aggregated from third-party sources.</li>
                <li>The <strong>uninterrupted or error-free</strong> operation of the Platform.</li>
                <li>The <strong>security</strong> of the Platform or that your data will be free from unauthorized access.</li>
                <li>The <strong>suitability</strong> of the Platform for any particular purpose.</li>
              </ul>
              <p className="mt-2"><strong>Important:</strong> SarkariScout aggregates information from various government and public sources. We are not the official source for any job posting or examination. You are solely responsible for verifying all details — including eligibility criteria, application deadlines, examination dates, and fee structures — directly on the official government website before submitting any application or payment.</p>
              <p className="mt-2">We shall not be held liable for any reliance placed on information displayed on the Platform, including but not limited to missed deadlines, incorrect eligibility assumptions, or application errors.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">8. Limitation of Liability</h2>
              <p>To the maximum extent permitted by applicable law, SarkariScout and its officers, directors, employees, and agents shall not be liable for any:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Errors or Omissions:</strong> Inaccuracies, typographical errors, or omissions in job postings, exam notifications, or any other information displayed on the Platform.</li>
                <li><strong>Missed Deadlines:</strong> Failure to apply for a position or examination due to reliance on information provided through the Platform.</li>
                <li><strong>Indirect Damages:</strong> Any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Platform.</li>
                <li><strong>Third-Party Actions:</strong> Actions or omissions of government agencies, examination bodies, or other third parties referenced on the Platform.</li>
                <li><strong>Technical Failures:</strong> Any interruption, suspension, or termination of the Platform due to technical issues, maintenance, or circumstances beyond our reasonable control.</li>
              </ul>
              <p className="mt-2">In no event shall our total aggregate liability exceed <strong>one hundred Indian Rupees (₹100)</strong> or the amount paid by you to us in the twelve months preceding the claim, whichever is greater.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">9. Indemnification</h2>
              <p>You agree to indemnify, defend, and hold harmless SarkariScout and its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorney's fees) arising out of or in connection with:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Your use of the Platform or any services obtained through the Platform.</li>
                <li>Your violation of these Terms or any applicable law, rule, or regulation.</li>
                <li>Your violation of any rights of a third party, including intellectual property rights.</li>
                <li>Any content you submit, post, or transmit through the Platform.</li>
                <li>Your negligence or willful misconduct in connection with your use of the Platform.</li>
              </ul>
              <p className="mt-2">We reserve the right to assume the exclusive defense and control of any matter subject to indemnification by you, at your expense.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">10. Account Termination</h2>
              <h3 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">10.1 Termination by SarkariScout</h3>
              <p>We reserve the right to suspend or permanently terminate your account and access to the Platform at our sole discretion, without prior notice, if:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>You violate any provision of these Terms.</li>
                <li>We reasonably suspect fraudulent, abusive, or illegal activity.</li>
                <li>Your actions may create legal liability for SarkariScout or other users.</li>
                <li>We are required to do so by applicable law or a valid court order.</li>
              </ul>
              <h3 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">10.2 Termination by User</h3>
              <p>You may delete your account at any time through your <strong>Profile Settings</strong> page or by contacting us at <a href="mailto:support@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">support@sarkariscout.in</a>. Upon deletion:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Your personal data will be removed within 30 days, except where retention is required by law.</li>
                <li>Any active email subscriptions will be immediately cancelled.</li>
                <li>You will lose access to all account-specific features, including job tracking data and saved preferences.</li>
              </ul>
              <p className="mt-2">Termination of your account does not relieve you of any obligations incurred prior to termination.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">11. Dispute Resolution</h2>
              <p>These Terms shall be governed by and construed in accordance with the <strong>laws of India</strong>. Any dispute, controversy, or claim arising out of or relating to these Terms or the Platform shall be subject to the <strong>exclusive jurisdiction of the courts in India</strong>.</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Governing Law:</strong> These Terms are governed by the Indian Contract Act, 1872, the Information Technology Act, 2000, and other applicable Indian legislation.</li>
                <li><strong>Jurisdiction:</strong> Any legal proceedings arising from these Terms shall be initiated in the courts of competent jurisdiction within India.</li>
                <li><strong>Informal Resolution:</strong> Before initiating formal proceedings, you agree to first contact us at <a href="mailto:support@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">support@sarkariscout.in</a> and attempt to resolve the dispute informally for a period of at least thirty (30) days.</li>
                <li><strong>Class Action Waiver:</strong> You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">12. Contact Information</h2>
              <p>If you have any questions, concerns, or complaints about these Terms of Service, please contact us:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Email:</strong> <a href="mailto:support@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">support@sarkariscout.in</a></li>
                <li><strong>Website:</strong> <a href="https://sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">sarkariscout.in</a></li>
              </ul>
              <p className="mt-2">We aim to respond to all inquiries within seven (7) business days.</p>
            </section>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-8">
              <p className="text-xs text-gray-500 dark:text-gray-400">By using SarkariScout, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these Terms, you must discontinue use of the Platform immediately and, if applicable, delete your account.</p>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
