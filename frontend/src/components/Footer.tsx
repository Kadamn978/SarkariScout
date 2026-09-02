import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'

export default function Footer() {
  const { user } = useAuth()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const columns = [
    {
      title: 'Jobs',
      links: [
        { to: '/jobs', label: 'All Jobs' },
      ],
    },
    {
      title: 'Company',
      links: [
        { to: '/about', label: 'About' },
        { to: '/faq', label: 'FAQ' },
      ],
    },
    {
      title: 'Categories',
      links: [
        { to: '/jobs?category=GOVERNMENT', label: 'Government' },
        { to: '/jobs?category=BANKING', label: 'Banking' },
        { to: '/jobs?category=RAILWAY', label: 'Railway' },
        { to: '/jobs?category=ENGINEERING', label: 'Engineering' },
        { to: '/jobs?category=DEFENCE', label: 'Defence' },
      ],
    },
  ]

  if (user) {
    columns.push({
      title: 'Account',
      links: [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/profile', label: 'Profile' },
        { to: '/email-preferences', label: 'Email Settings' },
        { to: '/bug-report', label: 'Report Bug' },
      ],
    })
  }

  return (
    <footer className="bg-gray-900 text-gray-300 relative overflow-hidden" role="contentinfo">
      {/* Gradient line at top */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className={`grid grid-cols-2 gap-8 ${user ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
          <ScrollReveal delay={0}>
            <div>
              <Link to="/" className="text-xl font-bold text-white tracking-tight inline-block mb-4">
                Rozgar<span className="text-blue-400">Scout</span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed">Never miss a government job. Get personalized alerts for Sarkari Naukri.</p>
            </div>
          </ScrollReveal>

          {columns.map((col, colIdx) => (
            <ScrollReveal key={col.title} delay={(colIdx + 1) * 100}>
              <div>
                <h4 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2.5 text-sm">
                  {col.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        onClick={scrollToTop}
                        className="text-gray-400 hover:text-white hover:pl-1 transition-all duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} RozgarScout. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              {['Privacy', 'Terms', 'Contact'].map((label) => (
                <motion.div key={label} whileHover={{ y: -2 }}>
                  <Link
                    to={`/${label.toLowerCase()}`}
                    onClick={scrollToTop}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  )
}
