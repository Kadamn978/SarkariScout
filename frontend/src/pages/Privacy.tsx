import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useSEO } from '../hooks/useSEO'

export default function Privacy() {
  useSEO({
    title: 'Privacy Policy',
    description: 'SarkariScout Privacy Policy. Learn how we collect, use, and protect your personal data in compliance with the Digital Personal Data Protection Act 2023.',
    canonical: 'https://sarkariscout.in/privacy',
    ogTitle: 'Privacy Policy | SarkariScout',
    ogDescription: 'How SarkariScout handles your personal data. DPDP Act compliant.',
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
              <p>SarkariScout ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website (sarkariscout.in) and related services (collectively, the "Platform").</p>
              <p className="mt-2">By using the Platform, you consent to the practices described in this policy. If you do not agree, please discontinue use of the Platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Information We Collect</h2>
              <h3 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">2.1 Information You Provide</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Account Information:</strong> Name, email address, and password (hashed) when you register.</li>
                <li><strong>Profile Data:</strong> Education level, state, category, age, and job preferences — provided optionally to enable personalized job matching.</li>
                <li><strong>Application Data:</strong> Job tracking information, application status updates, and notes you add to tracked jobs.</li>
                <li><strong>Communications:</strong> Messages you send us via contact forms, bug reports, or email.</li>
              </ul>

              <h3 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Usage Data:</strong> Pages visited, features used, search queries, and interaction patterns — collected to improve the Platform.</li>
                <li><strong>Device Information:</strong> Browser type, operating system, screen resolution, and device identifiers.</li>
                <li><strong>Log Data:</strong> IP address, access times, and referring URLs — retained for security and diagnostic purposes.</li>
              </ul>

              <h3 className="font-medium text-gray-900 dark:text-white mt-4 mb-2">2.3 Cookies and Similar Technologies</h3>
              <p>We use essential cookies for authentication and session management. Analytics and advertising cookies are loaded only with your explicit consent through our cookie consent banner. You may modify your preferences at any time.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. How We Use Your Information</h2>
              <p>We use the information we collect for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Service Delivery:</strong> To provide job alerts, personalized recommendations, mock tests, and application tracking.</li>
                <li><strong>Communication:</strong> To send job notifications, deadline reminders, and service updates via email (with opt-out available).</li>
                <li><strong>Platform Improvement:</strong> To analyze usage patterns, debug issues, and develop new features.</li>
                <li><strong>Security:</strong> To detect and prevent fraud, abuse, and unauthorized access.</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4. Data Sharing and Disclosure</h2>
              <p>We do not sell, rent, or trade your personal information. We may share data in the following limited circumstances:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Service Providers:</strong> Third-party vendors who assist with email delivery, hosting, and analytics — bound by contractual obligations to protect your data.</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets — with prior notice to users.</li>
                <li><strong>Aggregated Data:</strong> Anonymized, non-identifiable data may be shared for research or statistical purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">5. Data Security</h2>
              <p>We implement industry-standard security measures to protect your data, including:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Encryption of data in transit (TLS/HTTPS) and at rest</li>
                <li>Secure password hashing (argon2id)</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Automated threat detection and monitoring</li>
              </ul>
              <p className="mt-2">While we strive to protect your information, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6. Data Retention</h2>
              <p>We retain your personal data only for as long as necessary to provide our services or as required by law:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Account Data:</strong> Retained until you delete your account, plus 30 days for backup purposes.</li>
                <li><strong>Usage Logs:</strong> Retained for 90 days for security and diagnostic purposes.</li>
                <li><strong>Application Tracking Data:</strong> Retained as long as your account is active.</li>
                <li><strong>Communications:</strong> Retained for 12 months to maintain support history.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">7. Your Rights</h2>
              <p>Under applicable data protection laws, you have the following rights:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data.</li>
                <li><strong>Portability:</strong> Request your data in a structured, machine-readable format.</li>
                <li><strong>Withdrawal of Consent:</strong> Withdraw consent for data processing at any time (where processing is based on consent).</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails via the link in each email or through your account settings.</li>
              </ul>
              <p className="mt-2">To exercise these rights, contact us at <a href="mailto:privacy@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@sarkariscout.in</a>. We will respond within 30 days.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">8. Children's Privacy</h2>
              <p>The Platform is not intended for users under the age of 18. We do not knowingly collect personal data from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information promptly. If you are a parent or guardian and believe your child has provided us with personal data, please contact us.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">9. Digital Personal Data Protection Act 2023 (DPDP)</h2>
              <p>In compliance with India's Digital Personal Data Protection Act 2023:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Data Fiduciary:</strong> SarkariScout (sarkariscout.in)</li>
                <li><strong>Consent Notice:</strong> We collect your personal data only with your explicit consent for the purpose of providing government job alerts and related services.</li>
                <li><strong>Purpose Limitation:</strong> Your data is used solely for sending job notifications, matching eligibility, and improving our services.</li>
                <li><strong>Data Principal Rights:</strong> You have the right to access, correct, erase, and seek grievance redressal regarding your personal data.</li>
                <li><strong>Data Retention:</strong> We retain your data only as long as necessary for the stated purpose or until you exercise your right to erasure.</li>
                <li><strong>Cross-Border Transfer:</strong> Your data is stored on servers located within India and is not transferred outside the country.</li>
                <li><strong>Grievance Redressal:</strong> For data-related concerns, contact our Data Protection Officer at <a href="mailto:dpo@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">dpo@sarkariscout.in</a>. We will respond within 30 days.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">10. Third-Party Links</h2>
              <p>The Platform may contain links to external government websites and third-party services. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">11. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. Material changes will be communicated via email or a prominent notice on the Platform. Your continued use of the Platform after changes are posted constitutes acceptance of the revised policy.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">12. Contact Us</h2>
              <p>For questions or concerns about this Privacy Policy:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Email:</strong> <a href="mailto:privacy@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@sarkariscout.in</a></li>
                <li><strong>Data Protection Officer:</strong> <a href="mailto:dpo@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">dpo@sarkariscout.in</a></li>
                <li><strong>General Support:</strong> <a href="mailto:support@sarkariscout.in" className="text-blue-600 dark:text-blue-400 hover:underline">support@sarkariscout.in</a></li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
