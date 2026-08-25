import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'

interface AdmitCardJob {
  id: string; title: string; org: string; state: string;
  admitCardDate: string | null; examDate: string | null;
  totalVacancies: number | null; category: string;
  source: { name: string } | null; sourceUrl: string | null;
}

export default function AdmitCards() {
  const [jobs, setJobs] = useState<AdmitCardJob[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadJobs() }, [])

  async function loadJobs() {
    try {
      const res = await api.get('/jobs?limit=100&status=OPEN')
      setJobs(res.data.jobs.filter((j: AdmitCardJob) => j.admitCardDate))
    } catch { console.error('Failed') }
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

  const available = filtered.filter((j) => j.admitCardDate && new Date(j.admitCardDate).getTime() <= Date.now())
  const upcoming = filtered.filter((j) => j.admitCardDate && new Date(j.admitCardDate).getTime() > Date.now())

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Admit Cards</h1>
          <p className="text-gray-500 mt-1">Download admit cards for upcoming exams</p>
        </div>

        <div className="mb-6">
          <input type="search" placeholder="Search admit cards..." onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl animate-pulse"><div className="h-5 bg-gray-200 rounded w-2/3 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/3" /></div>
          ))}</div>
        ) : (
          <>
            {available.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Available Now ({available.length})
                </h2>
                <div className="space-y-2">
                  {available.map((job) => {
                    const diff = job.examDate ? daysUntil(job.examDate) : 999
                    return (
                      <Link key={job.id} to={`/jobs/${job.id}`}
                        className="flex items-center gap-4 bg-white p-4 rounded-xl border border-green-200 bg-green-50/30 hover:shadow-md hover:border-green-300 transition group">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate group-hover:text-blue-600">{job.title}</p>
                          <p className="text-sm text-gray-500">{job.org} • {job.state === 'ALL_IN' ? 'All India' : job.state}</p>
                          <p className="text-xs text-green-700 mt-1">Admit card available from {job.admitCardDate ? formatDate(job.admitCardDate) : '—'}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          {job.examDate && (
                            <div>
                              <p className="text-xs text-gray-500">Exam on</p>
                              <p className="text-sm font-semibold text-gray-900">{formatDate(job.examDate)}</p>
                              {diff > 0 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diff <= 7 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {diff} days left
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {upcoming.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Uploading Soon ({upcoming.length})
                </h2>
                <div className="space-y-2">
                  {upcoming.map((job) => (
                    <Link key={job.id} to={`/jobs/${job.id}`}
                      className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md hover:border-blue-200 transition group">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate group-hover:text-blue-600">{job.title}</p>
                        <p className="text-sm text-gray-500">{job.org}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm text-gray-700">{job.admitCardDate ? formatDate(job.admitCardDate) : '—'}</p>
                        {(() => { const d = job.admitCardDate ? daysUntil(job.admitCardDate) : 999; return d > 0 ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">In {d} days</span>
                        ) : null })()}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {available.length === 0 && upcoming.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl">
                <p className="text-gray-500 text-lg">No admit cards found</p>
                <p className="text-gray-400 text-sm mt-1">Admit cards will appear here when available</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
