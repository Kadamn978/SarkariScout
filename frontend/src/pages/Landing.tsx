import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import api from '../lib/api'
import { useSEO } from '../hooks/useSEO'
import MagneticButton from '../components/MagneticButton'
import AnimatedCounter from '../components/AnimatedCounter'
import ScrollReveal from '../components/ScrollReveal'
import TextScramble from '../components/TextScramble'
import FeatureCube from '../components/FeatureCube'
import Icon from '../components/Icon'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

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
  { name: 'SSC', color: 'from-blue-500 to-cyan-400', icon: 'file' },
  { name: 'UPSC', color: 'from-purple-500 to-pink-400', icon: 'building' },
  { name: 'Banking', color: 'from-green-500 to-emerald-400', icon: 'briefcase' },
  { name: 'Railway', color: 'from-orange-500 to-yellow-400', icon: 'train' },
  { name: 'Engineering', color: 'from-red-500 to-rose-400', icon: 'cog' },
  { name: 'Defence', color: 'from-amber-500 to-orange-400', icon: 'shield' },
  { name: 'Police', color: 'from-indigo-500 to-blue-400', icon: 'police' },
  { name: 'Medical', color: 'from-teal-500 to-green-400', icon: 'hospital' },
  { name: 'Teaching', color: 'from-violet-500 to-purple-400', icon: 'graduation' },
  { name: 'IT', color: 'from-sky-500 to-blue-400', icon: 'code' },
]

const FEATURES = [
  { icon: 'bell', title: 'Smart Alerts', desc: 'Personalized notifications based on your education, state, and category.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: 'globe', title: '30+ Sources', desc: 'SSC, UPSC, Railways, IBPS, State PSCs — all monitored 24/7.', gradient: 'from-purple-500 to-pink-500' },
  { icon: 'clock', title: 'Deadline Tracker', desc: 'Never miss an application deadline. Get alerts before time runs out.', gradient: 'from-orange-500 to-red-500' },
  { icon: 'clipboard', title: 'Application Tracker', desc: 'Track every job you apply for — from Interest to Applied to Exam to Result. Get notified of deadline changes and status updates.', gradient: 'from-pink-500 to-rose-500' },
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
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
  const [latestJobs, setLatestJobs] = useState<Job[]>([])
  const [expiringJobs, setExpiringJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8])
  const heroTextY = useTransform(scrollYProgress, [0, 0.4], [0, 80])
  const heroParticlesY = useTransform(scrollYProgress, [0, 0.5], [0, 120])
  const heroGradientY = useTransform(scrollYProgress, [0, 0.6], [0, 60])

  useSEO({
    title: 'Government Job Alerts, Mock Tests & Previous Papers',
    description: 'Get personalized government job alerts for SSC, UPSC, IBPS, RRB & more. Free mock tests, previous year papers, and application tracker for Indian aspirants.',
    canonical: 'https://rozgarscout.in',
    ogTitle: 'RozgarScout - Government Job Alerts & Preparation',
    ogDescription: 'Never miss a Sarkari Naukri. Free alerts, mock tests, and papers for SSC, UPSC, IBPS, RRB.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'RozgarScout',
      'url': 'https://rozgarscout.in',
      'description': 'Government job alerts, mock tests, and previous year papers for SSC, UPSC, IBPS, RRB.',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://rozgarscout.in/jobs?search={search_term_string}',
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
    } catch (e) { /* console.error(e) */ }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      <Navbar />

      {/* HERO — Awwwards Level */}
      <motion.section ref={heroRef} style={{ scale: heroScale, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated Gradient Background */}
        <motion.div style={{ y: heroGradientY }} className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 animate-gradient" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden="true" />

        {/* Particles with parallax */}
        <motion.div style={{ y: heroParticlesY }} className="absolute inset-0">
          <HeroParticles />
        </motion.div>

        {/* Grain Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]" aria-hidden="true"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 opacity-30" aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(at 40% 20%, rgba(59,130,246,0.4) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(147,51,234,0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(236,72,153,0.2) 0px, transparent 50%)' }} />

        <motion.div style={{ y: heroTextY }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/80 text-sm mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live: Updates from official government portals
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight mb-6">
            <motion.span
              initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              Never Miss a
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent"
            >
              Sarkari Naukri
            </motion.span>
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
        </motion.div>

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
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-widest">Why RozgarScout</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
                <TextScramble text="Not Just Another Job Site" trigger="hover" />
              </h2>
              <p className="text-blue-200/60 max-w-xl mx-auto text-lg">We don't just list jobs. We think, match, and alert — so you never miss what matters.</p>
            </div>
          </ScrollReveal>

          {/* 3D Feature Cube */}
          <ScrollReveal delay={200}>
            <div className="mb-16 hidden lg:block">
              <FeatureCube />
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              { icon: 'brain', title: 'Smart Profile Matching', desc: 'We match jobs to YOUR profile — education, state, age, category. No noise, only relevance.', highlight: 'Other sites show 1000+ random jobs. We show 10 that matter.' },
              { icon: 'lightning', title: 'Real-Time Updates', desc: 'We detect corrigendum, date extensions, and vacancy changes within hours.', highlight: 'Others show stale data. We catch every update.' },
              { icon: 'chart', title: 'Application Tracker', desc: 'Update the status of jobs you applied for — from Interest to Selection. We send you deadline alerts and change notifications so you never miss an update.', highlight: 'Track what matters. Get notified of changes.' },
              { icon: 'calendar', title: 'All Dates in One View', desc: 'Exam calendar, admit cards, results — every important date on a single timeline.', highlight: 'Others scatter dates. We consolidate them.' },
              { icon: 'ban', title: 'Zero Noise, Zero Spam', desc: 'No pop-ups, no fake urgency, no affiliate clutter. Clean. Focused. Free.', highlight: 'Others monetize your attention. We respect it.' },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="group p-6 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-500 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon name={item.icon} size={24} className="text-blue-400" />
                  </div>
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
                30+ sources monitored every 6 hours
              </div>
              <br />
              <MagneticButton className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl text-lg font-bold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow mt-4">
                <Link to="/register" className="flex items-center gap-2">
                   Try RozgarScout Free
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
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mt-3 mb-4"><TextScramble text="Everything You Need" trigger="hover" /></h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">One platform for your entire government job preparation journey.</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 100}>
              <div className="group relative p-8 rounded-3xl glass-card card-shine cursor-default h-full flex flex-col">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon name={f.icon} size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{f.desc}</p>
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
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mt-2"><TextScramble text="Browse by Exam" trigger="hover" /></h2>
          </div>
        </ScrollReveal>
        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
          {EXAM_FAMILIES.map((fam, i) => (
            <ScrollReveal key={fam.name} delay={i * 60}>
              <Link to={`/jobs?search=${fam.name}`}
                className="group flex flex-col items-center p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-500 hover-lift card-shine snap-start min-w-[140px] lg:min-w-0">
                <span className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${fam.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <Icon name={fam.icon} size={28} className="text-white" />
                </span>
                <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">{fam.name}</span>
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
            <Link to="/jobs"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover-lift">
              All India
            </Link>
            {INDIAN_STATES.map((state) => (
              <Link key={state} to={`/state/${state.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-300 hover-lift">
                {state}
              </Link>
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
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6"><TextScramble text="Ready to Start?" trigger="hover" /></h2>
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

      <Footer />
    </div>
  )
}
