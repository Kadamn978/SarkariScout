import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import Navbar from '../components/Navbar'
import ScrollReveal from '../components/ScrollReveal'
import TiltCard from '../components/TiltCard'
import AnimatedCounter from '../components/AnimatedCounter'

interface Progress {
  tracked: number; applied: number; examPrep: number; selected: number;
  testsAttempted: number; avgScore: number;
  papersDownloaded: number; daysActive: number;
}

export default function Progress() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/jobs/user/tracked').catch(() => ({ data: [] })),
      api.get('/jobs/user/stats').catch(() => ({ data: {} })),
      api.get('/mock-tests/history').catch(() => ({ data: [] })),
    ]).then(([tracked, stats, tests]) => {
      const jobs = tracked.data
      const stages = { tracked: 0, applied: 0, examPrep: 0, selected: 0 }
      for (const j of jobs) {
        if (j.stage === 'APPLIED') stages.applied++
        else if (j.stage === 'EXAM_PREP') stages.examPrep++
        else if (j.stage === 'SELECTED') stages.selected++
        else stages.tracked++
      }
      const testHistory = tests.data
      const avgScore = testHistory.length > 0
        ? Math.round(testHistory.reduce((a: number, t: any) => a + (t.totalMarks > 0 ? (t.score / t.totalMarks) * 100 : 0), 0) / testHistory.length)
        : 0

      setProgress({
        tracked: stages.tracked, applied: stages.applied,
        examPrep: stages.examPrep, selected: stages.selected,
        testsAttempted: testHistory.length, avgScore,
        papersDownloaded: stats.data.papersDownloaded || 0,
        daysActive: stats.data.daysActive || 1,
      })
    }).finally(() => setLoading(false))
  }, [])

  const stages = [
    { label: 'Tracked', value: progress?.tracked || 0, color: 'bg-gray-500', icon: '📋' },
    { label: 'Applied', value: progress?.applied || 0, color: 'bg-blue-500', icon: '📤' },
    { label: 'Exam Prep', value: progress?.examPrep || 0, color: 'bg-purple-500', icon: '📖' },
    { label: 'Selected', value: progress?.selected || 0, color: 'bg-green-500', icon: '🎉' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <ScrollReveal>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Your Progress</h1>
          <p className="text-gray-500 mb-8">Track your government job preparation journey</p>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-20" />
            </div>
          ))}</div>
        ) : progress && (
          <>
            {/* Pipeline */}
            <ScrollReveal>
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
                <h2 className="font-semibold text-gray-900 mb-6">Application Pipeline</h2>
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  {stages.map((s, i) => (
                    <div key={s.label} className="flex-1 text-center">
                      <div className="relative mb-3">
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl ${s.color} bg-opacity-10 flex items-center justify-center text-2xl sm:text-3xl`}>
                          {s.icon}
                        </div>
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-xs font-bold text-gray-900">
                          <AnimatedCounter target={s.value} />
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>
                {/* Pipeline bar */}
                <div className="mt-6 flex h-3 rounded-full overflow-hidden bg-gray-100">
                  {stages.map((s, i) => {
                    const total = stages.reduce((a, b) => a + b.value, 0) || 1
                    const width = (s.value / total) * 100
                    return width > 0 ? (
                      <div key={i} className={`${s.color} transition-all duration-700`} style={{ width: `${width}%` }} />
                    ) : null
                  })}
                </div>
              </div>
            </ScrollReveal>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Tests Attempted', value: progress.testsAttempted, suffix: '', color: 'text-purple-600', icon: '📝' },
                { label: 'Avg Score', value: progress.avgScore, suffix: '%', color: 'text-blue-600', icon: '📊' },
                { label: 'Papers Downloaded', value: progress.papersDownloaded, suffix: '', color: 'text-green-600', icon: '📄' },
                { label: 'Days Active', value: progress.daysActive, suffix: '', color: 'text-orange-600', icon: '🔥' },
              ].map((s, i) => (
                <ScrollReveal key={i} delay={i * 80}>
                  <TiltCard className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                    <span className="text-2xl mb-2 block">{s.icon}</span>
                    <p className={`text-2xl sm:text-3xl font-black ${s.color}`}>
                      <AnimatedCounter target={s.value} suffix={s.suffix} />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </TiltCard>
                </ScrollReveal>
              ))}
            </div>

            {/* Study Streak */}
            <ScrollReveal>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Study Streak</h2>
                    <p className="text-blue-200 text-sm">Keep going! Consistency is key.</p>
                  </div>
                  <div className="text-5xl">🔥</div>
                </div>
                <div className="mt-6 flex gap-2">
                  {['M','T','W','T','F','S','S'].map((d, i) => {
                    const active = i < (progress.daysActive % 7 || 7)
                    return (
                      <div key={i} className={`flex-1 text-center py-3 rounded-xl ${active ? 'bg-white/20' : 'bg-white/5'}`}>
                        <p className="text-xs text-blue-200 mb-1">{d}</p>
                        <div className={`w-3 h-3 mx-auto rounded-full ${active ? 'bg-green-400' : 'bg-white/10'}`} />
                      </div>
                    )
                  })}
                </div>
              </div>
            </ScrollReveal>

            {/* Quick Actions */}
            <ScrollReveal>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Link to="/mock-tests" className="p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all text-center hover-lift">
                  <span className="text-2xl block mb-2">📝</span>
                  <p className="font-semibold text-gray-900 text-sm">Take a Test</p>
                </Link>
                <Link to="/papers" className="p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all text-center hover-lift">
                  <span className="text-2xl block mb-2">📄</span>
                  <p className="font-semibold text-gray-900 text-sm">Practice Papers</p>
                </Link>
                <Link to="/jobs" className="p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all text-center hover-lift col-span-2 sm:col-span-1">
                  <span className="text-2xl block mb-2">🔍</span>
                  <p className="font-semibold text-gray-900 text-sm">Browse Jobs</p>
                </Link>
              </div>
            </ScrollReveal>
          </>
        )}
      </main>
    </div>
  )
}
