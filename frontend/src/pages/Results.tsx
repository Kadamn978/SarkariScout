import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'

interface ResultJob {
  id: string; title: string; org: string; state: string;
  resultDate: string | null; examDate: string | null;
  totalVacancies: number | null; category: string;
  source: { name: string } | null; sourceUrl: string | null;
}

const CATEGORIES = ['GOVERNMENT', 'BANKING', 'RAILWAY', 'ENGINEERING', 'DEFENCE', 'PSU', 'POLICE', 'IT', 'TEACHING', 'MEDICAL']

export default function Results() {
  const [jobs, setJobs] = useState<ResultJob[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { loadJobs() }, [category])

  async function loadJobs() {
    setLoading(true)
    try {
      const params: Record<string, any> = { limit: 100 }
      if (category) params.category = category
      const res = await api.get('/jobs', { params })
      setJobs(res.data.jobs.filter((j: ResultJob) => j.resultDate))
    } catch { console.error('Failed to load') }
    finally { setLoading(false) }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function daysUntil(d: string) {
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  }

  const filtered = jobs.filter((j) =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.org.toLowerCase().includes(search.toLowerCase())
  )

  const declared = filtered.filter((j) => j.resultDate && new Date(j.resultDate).getTime() <= Date.now())
  const upcoming = filtered.filter((j) => j.resultDate && new Date(j.resultDate).getTime() > Date.now())

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Results</h1>
          <p className="text-gray-500 mt-1">Declared and upcoming exam results</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="search" placeholder="Search results..." onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl animate-pulse"><div className="h-5 bg-gray-200 rounded w-2/3 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/3" /></div>
          ))}</div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Upcoming Results ({upcoming.length})
                </h2>
                <div className="space-y-2">
                  {upcoming.map((job) => {
                    const diff = job.resultDate ? daysUntil(job.resultDate) : 999
                    return (
                      <Link key={job.id} to={`/jobs/${job.id}`}
                        className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md hover:border-blue-200 transition group">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate group-hover:text-blue-600">{job.title}</p>
                          <p className="text-sm text-gray-500">{job.org} • {job.state === 'ALL_IN' ? 'All India' : job.state}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-gray-900">{job.resultDate ? formatDate(job.resultDate) : '—'}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diff <= 3 ? 'bg-green-100 text-green-700' : diff <= 14 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                            {diff <= 0 ? 'Any time now' : `In ${diff} days`}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {declared.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Recently Declared ({declared.length})
                </h2>
                <div className="space-y-2">
                  {declared.map((job) => (
                    <Link key={job.id} to={`/jobs/${job.id}`}
                      className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md hover:border-blue-200 transition group">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate group-hover:text-blue-600">{job.title}</p>
                        <p className="text-sm text-gray-500">{job.org}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm text-gray-700">{job.resultDate ? formatDate(job.resultDate) : '—'}</p>
                        {job.sourceUrl && (
                          <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                            className="text-xs text-blue-600 hover:underline">Check Result →</a>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {upcoming.length === 0 && declared.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl">
                <p className="text-gray-500 text-lg">No results found</p>
                <p className="text-gray-400 text-sm mt-1">Results will appear here once declared</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
