import { useEffect, useRef } from 'react'

interface SEOData {
  title?: string
  description?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  jsonLd?: Record<string, any>
}

export function useSEO(data: SEOData) {
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    const prevTitle = document.title

    if (data.title) {
      document.title = `${data.title} | SarkariScout`
    }

    const meta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
      if (!el) {
        el = document.createElement('meta')
        el.name = name
        document.head.appendChild(el)
      }
      el.content = content
    }

    const ogMeta = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('property', prop)
        document.head.appendChild(el)
      }
      el.content = content
    }

    if (data.description) meta('description', data.description)
    if (data.ogTitle) ogMeta('og:title', data.ogTitle)
    if (data.ogDescription) ogMeta('og:description', data.ogDescription)
    if (data.ogImage) ogMeta('og:image', data.ogImage)
    if (data.canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = data.canonical
    }

    // Add hreflang tag for Indian English audience
    let hreflang = document.querySelector('link[rel="alternate"][hreflang="en-in"]') as HTMLLinkElement
    if (!hreflang) {
      hreflang = document.createElement('link')
      hreflang.rel = 'alternate'
      hreflang.hreflang = 'en-in'
      document.head.appendChild(hreflang)
    }
    if (data.canonical) {
      hreflang.href = data.canonical
    }

    if (data.jsonLd) {
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current)
      }
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(data.jsonLd)
      document.head.appendChild(script)
      scriptRef.current = script
    }

    return () => {
      document.title = prevTitle
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current)
        scriptRef.current = null
      }
    }
  }, [data.title, data.description, data.canonical, data.ogTitle, data.ogDescription, data.ogImage, JSON.stringify(data.jsonLd)])
}
