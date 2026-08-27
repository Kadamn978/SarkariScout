import { useState, useEffect } from 'react';

const COOKIE_KEY = 'sarkariscout_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    }));
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              We value your privacy
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              We use cookies to enhance your experience, analyze site traffic, and personalize content.
              By clicking &quot;Accept All&quot;, you consent to our use of cookies under the{' '}
              <a href="/privacy" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/terms" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">
                Terms of Service
              </a>.
              Under India&apos;s Digital Personal Data Protection Act 2023 (DPDP), we require your consent
              before collecting any personal data via cookies.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={reject}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Reject Non-Essential
            </button>
            <button
              onClick={accept}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
