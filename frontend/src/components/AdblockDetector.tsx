import { useState, useEffect } from 'react'

export default function AdblockDetector() {
  const [blocked, setBlocked] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const testAd = document.createElement('div')
      testAd.className = 'adsbygoogle'
      testAd.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px'
      testAd.innerHTML = '&nbsp;'
      document.body.appendChild(testAd)

      if (
        testAd.offsetHeight === 0 ||
        testAd.clientHeight === 0 ||
        getComputedStyle(testAd).display === 'none'
      ) {
        setBlocked(true)
      }
      document.body.removeChild(testAd)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const key = 'sc_adblock_dismissed'
    if (sessionStorage.getItem(key)) setDismissed(true)
  }, [])

  function dismiss() {
    setDismissed(true)
    sessionStorage.setItem('sc_adblock_dismissed', '1')
  }

  if (!blocked || dismissed) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-3xl">
            🛡️
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            We noticed you're using an ad blocker
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
            We respect your experience. Our ads are <strong>non-intrusive</strong> — fixed sidebar banners only.{' '}
            <strong>No pop-ups, no overlays, no auto-play, no tracking.</strong> We'll never spam you.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">
              Your support keeps us free for everyone
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Disabling ad blocker for this site helps us maintain servers, crawl more sources, and send better job alerts — at zero cost to you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={dismiss}
              className="flex-1 px-5 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Continue anyway
            </button>
            <button
              onClick={dismiss}
              className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
            >
              Allow ads on this site
            </button>
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-4">
            We never show pop-ups, interstitials, or auto-play video ads. Just clean, static banners.
          </p>
        </div>
      </div>
    </div>
  )
}
