import { useEffect } from 'react'

interface SEOData {
  title?: string
  description?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  jsonLd?: Record<string, any>
}

export function useSEO(data: SEOData) {
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
    if (data.canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = data.canonical
    }

    if (data.jsonLd) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(data.jsonLd)
      document.head.appendChild(script)
      return () => {
        document.title = prevTitle
        document.head.removeChild(script)
      }
    }

    return () => {
      document.title = prevTitle
    }
  }, [data.title, data.description, data.canonical])
}
