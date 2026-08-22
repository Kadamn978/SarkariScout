import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

interface AdBannerProps {
  slot: string
  format?: string
  responsive?: boolean
  className?: string
}

export default function AdBanner({ slot, format = 'auto', responsive = true, className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      // AdSense not loaded yet
    }
  }, [])

  return (
    <div className={`ad-container ${className}`} role="complementary" aria-label="Advertisement">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-XXXXXXXXXX'}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}
