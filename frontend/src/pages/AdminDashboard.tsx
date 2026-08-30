import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

interface Stats {
  totalJobs: number
  openJobs: number
  expiringSoon: number
  totalUsers: number
  byCategory: { category: string; count: number }[]
  topStates: { state: string; count: number }[]
}

interface Source {
  id: string
  name: string
  type: string
  enabled: boolean
  lastRunAt: string | null
  lastRunStatus: string | null
  itemsPerRun: number
  lastError: string | null
}

interface CrawlResult {
  added: number
  updated: number
  errors: string[]
  duration: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [crawling, setCrawling] = useState<string | null>(null)
  const [crawlResults, setCrawlResults] = useState<Record<string, CrawlResult>>({})
  const [tab, setTab] = useState<'overview' | 'sources' | 'crawlers'>('overview')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [statsRes, sourcesRes] = await Promise.all([
        api.get('/matching/stats'),
        api.get('/crawler/stats'),
      ])
      setStats(statsRes.data)
      setSources(sourcesRes.data)
    } catch (e) { /* console.error(e) */ }
    finally { setLoading(false) }
  }

  async function crawlSource(sourceId: string) {
    setCrawling(sourceId)
    try {
      const res = await api.post(`/crawler/crawl/${sourceId}`)
      setCrawlResults((prev) => ({ ...prev, [sourceId]: res.data }))
      loadData()
    } catch (e) { /* console.error(e) */ }
    finally { setCrawling(null) }
  }

  async function crawlAll() {
    setCrawling('all')
    try {
      const res = await api.post('/crawler/crawl-all')
      setCrawlResults(res.data)
      loadData()
    } catch (e) { /* console.error(e) */ }
    finally { setCrawling(null) }
  }

  function timeAgo(dateStr: string | null) {
    if (!dateStr) return 'Never'
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Monitor and manage your NaukarScout instance</p>
          </div>
          <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-700">← Back to Dashboard</Link>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 max-w-md">
          {(['overview', 'sources', 'crawlers'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition capitalize ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Jobs', value: stats.totalJobs, color: 'text-blue-600' },
                { label: 'Open Jobs', value: stats.openJobs, color: 'text-green-600' },
                { label: 'Expiring Soon', value: stats.expiringSoon, color: 'text-orange-600' },
                { label: 'Users', value: stats.totalUsers, color: 'text-purple-600' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {stats.byCategory.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Jobs by Category</h3>
                <div className="space-y-2">
                  {stats.byCategory.map((c) => {
                    const pct = Math.round((c.count / stats.totalJobs) * 100)
                    return (
                      <div key={c.category} className="flex items-center gap-3">
                        <span className="w-32 text-sm text-gray-600">{c.category}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-16 text-right text-sm text-gray-500">{c.count} ({pct}%)</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {stats.topStates.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Top States</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {stats.topStates.map((s) => (
                    <div key={s.state} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="font-semibold text-gray-900">{s.count}</p>
                      <p className="text-xs text-gray-500">{s.state}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'sources' && (
          <div className="space-y-3">
            {sources.map((s) => (
              <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full shrink-0 ${s.lastRunStatus === 'ok' ? 'bg-green-500' : s.lastRunStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{s.type}</span>
                  </div>
                  <p className="text-sm text-gray-500">Last run: {timeAgo(s.lastRunAt)} | Items: {s.itemsPerRun}</p>
                  {s.lastError && <p className="text-xs text-red-500 mt-1 truncate">{s.lastError}</p>}
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {crawlResults[s.id] && (
                    <span className="text-xs text-green-600">
                      +{crawlResults[s.id].added} / ~{crawlResults[s.id].updated}
                    </span>
                  )}
                  <button
                    onClick={() => crawlSource(s.id)}
                    disabled={crawling !== null}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {crawling === s.id ? '...' : 'Crawl'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'crawlers' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Run All Crawlers</h3>
                <button
                  onClick={crawlAll}
                  disabled={crawling !== null}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {crawling === 'all' ? 'Running...' : 'Crawl All Sources'}
                </button>
              </div>
              <p className="text-sm text-gray-500">This will crawl all enabled sources sequentially with a 2-second delay between each.</p>
            </div>

            {Object.keys(crawlResults).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Last Crawl Results</h3>
                <div className="space-y-2">
                  {Object.entries(crawlResults).map(([id, r]) => (
                    <div key={id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-sm text-gray-900 w-32 truncate">{id}</span>
                      <span className="text-sm text-green-600">+{r.added} new</span>
                      <span className="text-sm text-blue-600">~{r.updated} updated</span>
                      <span className="text-sm text-gray-500">{r.duration}ms</span>
                      {r.errors.length > 0 && (
                        <span className="text-xs text-red-500">{r.errors.length} errors</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
