import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import api from '../lib/api'
import { useSEO } from '../hooks/useSEO'
import MagneticButton from '../components/MagneticButton'
import AnimatedCounter from '../components/AnimatedCounter'
import ScrollReveal from '../components/ScrollReveal'

interface Job {
  id: string; title: string; org: string; state: string;
  totalVacancies: number | null; applyEnd: string | null;
  category: string; createdAt: string;
}

interface Stats { totalJobs: number; openJobs: number; expiringSoon: number }

const INDIAN_STATES = [
  'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Delhi', 'Karnataka',
  'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'West Bengal',
  'Andhra Pradesh', 'Telangana', 'Kerala', 'Punjab', 'Haryana',
]

const EXAM_FAMILIES = [
  { name: 'SSC', color: 'from-blue-500 to-cyan-400', icon: '📘' },
  { name: 'UPSC', color: 'from-purple-500 to-pink-400', icon: '🏛️' },
  { name: 'Banking', color: 'from-green-500 to-emerald-400', icon: '🏦' },
  { name: 'Railway', color: 'from-orange-500 to-yellow-400', icon: '🚄' },
  { name: 'Engineering', color: 'from-red-500 to-rose-400', icon: '⚙️' },
  { name: 'Defence', color: 'from-amber-500 to-orange-400', icon: '🎖️' },
  { name: 'Police', color: 'from-indigo-500 to-blue-400', icon: '👮' },
  { name: 'Medical', color: 'from-teal-500 to-green-400', icon: '🏥' },
  { name: 'Teaching', color: 'from-violet-500 to-purple-400', icon: '📚' },
  { name: 'IT', color: 'from-sky-500 to-blue-400', icon: '💻' },
]

const FEATURES = [
  { icon: '🔔', title: 'Smart Alerts', desc: 'Personalized notifications based on your education, state, and category.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: '🌐', title: '20+ Sources', desc: 'SSC, UPSC, Railways, IBPS, State PSCs — all monitored 24/7.', gradient: 'from-purple-500 to-pink-500' },
  { icon: '⏰', title: 'Deadline Tracker', desc: 'Never miss an application deadline. Get alerts before time runs out.', gradient: 'from-orange-500 to-red-500' },
  { icon: '📝', title: 'Mock Tests', desc: 'Practice with real exam patterns. Score yourself and track improvement.', gradient: 'from-green-500 to-emerald-500' },
  { icon: '📄', title: 'Previous Papers', desc: 'Download previous year question papers for all major exams.', gradient: 'from-indigo-500 to-violet-500' },
  { icon: '📋', title: 'Application Tracker', desc: 'Track every job you apply for — from Interest to Applied to Exam to Result. Get notified of deadline changes and status updates.', gradient: 'from-pink-500 to-rose-500' },
]

function daysUntilDate(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) }

function ExpiringSlider({ jobs }: { jobs: Job[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  const next = useCallback(() => setCurrent((c) => (c + 1) % jobs.length), [jobs.length])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + jobs.length) % jobs.length), [jobs.length])

  useEffect(() => {
    if (paused || jobs.length <= 4) return
    timerRef.current = setInterval(next, 3000)
    return () => clearInterval(timerRef.current)
  }, [paused, next, jobs.length])

  const visible = jobs.length <= 4 ? jobs : jobs.slice(current, current + 4).concat(jobs.slice(0, Math.max(0, current + 4 - jobs.length)))

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {visible.map((job, i) => (
          <Link key={`${job.id}-${i}`} to={`/jobs/${job.id}`}
            className="block p-4 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-100 dark:border-red-800/50 hover:shadow-lg hover:border-red-200 dark:hover:border-red-700 transition-all duration-300 hover-lift card-shine">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">{job.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">{job.org}</p>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${daysUntilDate(job.applyEnd!) <= 3 ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
              {daysUntilDate(job.applyEnd!)} days left
            </span>
          </Link>
        ))}
      </div>
      {jobs.length > 4 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={prev} className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition" aria-label="Previous">
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-1.5">
            {jobs.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-red-500 w-4' : 'bg-gray-300 dark:bg-gray-600'}`} />
            ))}
          </div>
          <button onClick={next} className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition" aria-label="Next">
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}

function HeroParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white/5 animate-float"
          style={{
            width: Math.random() * 300 + 50,
            height: Math.random() * 300 + 50,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 5 + 5}s`,
          }} />
      ))}
    </div>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const [latestJobs, setLatestJobs] = useState<Job[]>([])
  const [expiringJobs, setExpiringJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8])

  useSEO({
    title: 'Government Job Alerts, Mock Tests & Previous Papers',
    description: 'Get personalized government job alerts for SSC, UPSC, IBPS, RRB & more. Free mock tests, previous year papers, and application tracker for Indian aspirants.',
    canonical: 'https://sarkariscout.in',
    ogTitle: 'SarkariScout - Government Job Alerts & Preparation',
    ogDescription: 'Never miss a Sarkari Naukri. Free alerts, mock tests, and papers for SSC, UPSC, IBPS, RRB.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'SarkariScout',
      'url': 'https://sarkariscout.in',
      'description': 'Government job alerts, mock tests, and previous year papers for SSC, UPSC, IBPS, RRB.',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://sarkariscout.in/jobs?search={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [latestRes, expiringRes, statsRes] = await Promise.all([
        api.get('/jobs/recent?limit=8'),
        api.get('/jobs/upcoming?days=7'),
        api.get('/matching/stats'),
      ])
      setLatestJobs(latestRes.data)
      setExpiringJobs(expiringRes.data)
      setStats(statsRes.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function daysUntil(d: string) { return daysUntilDate(d) }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* Animated Nav */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl sm:text-2xl font-bold gradient-text">SarkariScout</Link>
          <div className="hidden lg:flex items-center gap-1">
            {['Jobs', 'Calendar', 'Results', 'Admit Cards', 'Mock Tests', 'Papers'].map((l) => (
              <Link key={l} to={`/${l.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 rounded-lg hover:bg-blue-50/50 transition-all duration-300">
                {l}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <MagneticButton className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/25">
                <Link to="/dashboard">Dashboard</Link>
              </MagneticButton>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 px-3 py-2 hidden sm:block">Login</Link>
                <MagneticButton className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
                  <Link to="/register">Get Started</Link>
                </MagneticButton>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* HERO — Awwwards Level */}
      <motion.section ref={heroRef} style={{ scale: heroScale, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 animate-gradient" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <HeroParticles />

        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(at 40% 20%, rgba(59,130,246,0.4) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(147,51,234,0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(236,72,153,0.2) 0px, transparent 50%)' }} />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/80 text-sm mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live: Updates from official government portals
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight mb-6">
            Never Miss a<br />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              Sarkari Naukri
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl text-blue-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Personalized alerts for government jobs matching your education, state, and category.
            From SSC to UPSC, Railways to Banking — all in one place.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4">
            <MagneticButton className="px-10 py-4 bg-white text-blue-700 rounded-2xl text-lg font-bold shadow-2xl shadow-black/20 hover:shadow-black/30 transition-shadow">
              <Link to="/register" className="flex items-center gap-2">
                Start Free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </MagneticButton>
              <Link to="/jobs"
                className="px-10 py-4 border-2 border-white/30 text-white rounded-2xl text-lg font-semibold hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                Browse Jobs
              </Link>
          </motion.div>

          {/* Animated Stats */}
          {stats && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }}
              className="flex justify-center gap-16 sm:gap-24 mt-16 sm:mt-20">
              {[
                { value: stats.openJobs, label: 'Open Jobs', suffix: '+' },
                { value: stats.expiringSoon, label: 'Expiring Soon', suffix: '' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl sm:text-5xl font-black text-white">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-xs sm:text-sm text-blue-200/60 mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Scroll Indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-white/60 rounded-full mt-2" />
          </div>
        </motion.div>
      </motion.section>

      {/* Expiring Soon — Auto-slider */}
      {!loading && expiringJobs.length > 0 && (
        <section className="relative mt-0 z-20 px-4 pt-8">
          <ScrollReveal>
            <div className="max-w-6xl mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-red-500/10 border border-red-100 dark:border-red-900/50 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Expiring Soon — Apply Before It's Too Late</h2>
                  </div>
                  <Link to="/jobs" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hidden sm:block">See All →</Link>
                </div>
                <ExpiringSlider jobs={expiringJobs.slice(0, 10)} />
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* USP — Why We're Different */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.3) 0px, transparent 50%), radial-gradient(circle at 80% 50%, rgba(147,51,234,0.3) 0px, transparent 50%)' }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-widest">Why SarkariScout</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">Not Just Another Job Site</h2>
              <p className="text-blue-200/60 max-w-xl mx-auto text-lg">We don't just list jobs. We think, match, and alert — so you never miss what matters.</p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              { icon: '🧠', title: 'Smart Profile Matching', desc: 'We match jobs to YOUR profile — education, state, age, category. No noise, only relevance.', highlight: 'Other sites show 1000+ random jobs. We show 10 that matter.' },
              { icon: '⚡', title: 'Real-Time Updates', desc: 'We detect corrigendum, date extensions, and vacancy changes within hours.', highlight: 'Others show stale data. We catch every update.' },
              { icon: '📊', title: 'Application Tracker', desc: 'Update the status of jobs you applied for — from Interest to Selection. We send you deadline alerts and change notifications so you never miss an update.', highlight: 'Track what matters. Get notified of changes.' },
              { icon: '📅', title: 'All Dates in One View', desc: 'Exam calendar, admit cards, results — every important date on a single timeline.', highlight: 'Others scatter dates. We consolidate them.' },
              { icon: '🎯', title: 'Exam-Ready Practice', desc: 'Mock tests scored instantly. Previous papers organized by exam. Track your progress over time.', highlight: 'Others link to PDFs. We simulate the exam.' },
              { icon: '🚫', title: 'Zero Noise, Zero Spam', desc: 'No pop-ups, no fake urgency, no affiliate clutter. Clean. Focused. Free.', highlight: 'Others monetize your attention. We respect it.' },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="group p-6 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-500 h-full flex flex-col">
                  <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-blue-200/60 text-sm leading-relaxed mb-4 flex-1">{item.desc}</p>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-blue-300/80 italic">"{item.highlight}"</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white text-sm mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                20+ sources monitored every 6 hours
              </div>
              <br />
              <MagneticButton className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl text-lg font-bold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow mt-4">
                <Link to="/register" className="flex items-center gap-2">
                  Try SarkariScout Free
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features — Glass Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Features</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mt-3 mb-4">Everything You Need</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">One platform for your entire government job preparation journey.</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 100}>
              <div className="group relative p-8 rounded-3xl glass-card card-shine cursor-default">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Latest Jobs — Masonry Grid */}
      {!loading && latestJobs.length > 0 && (
        <section className="relative bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Latest</span>
                  <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mt-2">Fresh Opportunities</h2>
                </div>
                <MagneticButton className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/25 hidden sm:block">
                  <Link to="/jobs" className="flex items-center gap-2">View All Jobs →</Link>
                </MagneticButton>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {latestJobs.map((job, i) => (
                <ScrollReveal key={job.id} delay={i * 80}>
                  <Link to={`/jobs/${job.id}`}
                    className="block group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-500 hover-lift card-shine">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg">{job.category}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{job.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{job.org}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                        {job.state === 'ALL_IN' ? 'All India' : job.state}
                      </span>
                      {job.applyEnd && (
                        <span className="text-orange-500 dark:text-orange-400 font-medium">
                          Due {new Date(job.applyEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Exam Categories — Gradient Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Categories</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mt-2">Browse by Exam</h2>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {EXAM_FAMILIES.map((fam, i) => (
            <ScrollReveal key={fam.name} delay={i * 60}>
              <Link to={`/jobs?search=${fam.name}`}
                className="group flex flex-col items-center p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-500 hover-lift card-shine">
                <span className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${fam.color} flex items-center justify-center text-2xl mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {fam.icon}
                </span>
                <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{fam.name}</span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* State-wise — Tags */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Location</span>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mt-2">State-wise Jobs</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Find opportunities in your state</p>
            </div>
          </ScrollReveal>
          <div className="flex flex-wrap justify-center gap-3">
            <ScrollReveal>
              <Link to="/jobs"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover-lift">
                All India
              </Link>
            </ScrollReveal>
            {INDIAN_STATES.map((state, i) => (
              <ScrollReveal key={state} delay={i * 40} direction="none">
                <Link to={`/state/${state.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-300 hover-lift">
                  {state}
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — Full Width Gradient */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 animate-gradient" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(at 30% 20%, rgba(255,255,255,0.2) 0px, transparent 50%), radial-gradient(at 70% 80%, rgba(255,255,255,0.15) 0px, transparent 50%)' }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center py-24 sm:py-32 px-4">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">Ready to Start?</h2>
            <p className="text-xl text-blue-100/80 mb-10 max-w-xl mx-auto">Join thousands of aspirants who never miss a government job opportunity.</p>
            <MagneticButton className="px-12 py-5 bg-white text-blue-700 rounded-2xl text-xl font-bold shadow-2xl shadow-black/20 hover:shadow-black/30 transition-shadow">
              <Link to="/register" className="flex items-center gap-3">
                Create Free Account
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="text-xl font-bold gradient-text">SarkariScout</Link>
              <p className="text-sm mt-3 leading-relaxed">Never miss a government job. Free alerts, mock tests, and papers for every aspirant.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: 'Jobs', path: '/jobs' },
                  { label: 'Exam Calendar', path: '/exam-calendar' },
                  { label: 'Results', path: '/results' },
                  { label: 'Admit Cards', path: '/admit-cards' },
                  { label: 'Mock Tests', path: '/mock-tests' },
                  { label: 'Previous Year Papers', path: '/papers' },
                ].map((l) => (
                  <li key={l.path}><Link to={l.path} className="hover:text-white transition-colors duration-300">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Categories</h4>
              <ul className="space-y-2.5 text-sm">
                {['Government', 'Banking', 'Railway', 'Engineering', 'Defence', 'IT'].map((c) => (
                  <li key={c}><Link to={`/jobs?category=${c.toUpperCase()}`} className="hover:text-white transition-colors duration-300">{c}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors duration-300">About</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors duration-300">FAQ</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors duration-300">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors duration-300">Terms</Link></li>
                <li><Link to="/bug-report" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors duration-300">Report Bug</Link></li>
                <li><Link to="/contact" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors duration-300">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800/50 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} SarkariScout. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition">Privacy</Link>
              <Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition">Terms</Link>
              <Link to="/contact" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
