import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'
import ScrollReveal from '../components/ScrollReveal'

interface LeaderboardEntry {
  userId: string; name: string; score: number; totalMarks: number;
  testTitle: string; submittedAt: string;
}

interface TestHistory {
  id: string; testId: string; score: number; totalMarks: number;
  submittedAt: string; test: { title: string; examFamily: string; durationMinutes: number };
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [history, setHistory] = useState<TestHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'leaderboard' | 'history'>('leaderboard')

  useEffect(() => {
    Promise.all([
      api.get('/mock-tests/leaderboard').catch(() => ({ data: [] })),
      api.get('/mock-tests/history').catch(() => ({ data: [] })),
    ]).then(([lb, hist]) => {
      setLeaderboard(lb.data)
      setHistory(hist.data)
    }).finally(() => setLoading(false))
  }, [])

  function percentage(score: number, total: number) {
    return total > 0 ? Math.round((score / total) * 100) : 0
  }

  function medalForRank(rank: number) {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <ScrollReveal>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-gray-500 mb-6">See how you rank against other aspirants</p>
        </ScrollReveal>

        <div className="flex gap-2 mb-6">
          {(['leaderboard', 'history'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {t === 'leaderboard' ? 'Top Scorers' : 'My History'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/3 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/4" /></div>
            </div>
          ))}</div>
        ) : tab === 'leaderboard' ? (
          leaderboard.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl">
              <p className="text-4xl mb-3">🏆</p>
              <p className="text-gray-500 text-lg">No scores yet</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to take a mock test!</p>
              <Link to="/mock-tests" className="inline-block mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                Take a Test
              </Link>
            </div>
          ) : (
            <ScrollReveal>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {leaderboard.map((entry, i) => {
                  const pct = percentage(entry.score, entry.totalMarks)
                  return (
                    <div key={i} className={`flex items-center gap-4 p-5 ${i > 0 ? 'border-t border-gray-100' : ''} ${i < 3 ? 'bg-gradient-to-r from-blue-50/50 to-transparent' : ''}`}>
                      <span className="text-2xl w-12 text-center font-bold">{medalForRank(i + 1)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{entry.name}</p>
                        <p className="text-xs text-gray-500">{entry.testTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{entry.score}/{entry.totalMarks}</p>
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollReveal>
          )
        ) : (
          history.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-gray-500 text-lg">No test history yet</p>
              <Link to="/mock-tests" className="inline-block mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                Take Your First Test
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((h, i) => (
                <ScrollReveal key={h.id} delay={i * 60}>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {percentage(h.score, h.totalMarks)}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{h.test.title}</p>
                      <p className="text-sm text-gray-500">{h.test.examFamily} • {h.test.durationMinutes} min</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900">{h.score}/{h.totalMarks}</p>
                      <p className="text-xs text-gray-400">{new Date(h.submittedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  )
}
