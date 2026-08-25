import { useState, useEffect } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useSEO } from '../hooks/useSEO'

interface Job {
  id: string; title: string; org: string; state: string; district: string | null;
  category: string; totalVacancies: number | null; qualificationText: string | null;
  qualificationLevels: string | null; ageMin: number | null; ageMax: number | null;
  generalFee: number | null; obcFee: number | null; scStFee: number | null;
  applyStart: string | null; applyEnd: string | null; feePaymentEnd: string | null;
  examDate: string | null; admitCardDate: string | null; resultDate: string | null;
  status: string; applyUrl: string | null; officialNotificationUrl: string | null;
  notificationPdfUrl: string | null; eligibilityCriteria: string | null;
  howToApply: string | null; selectionProcess: string | null;
  source: { name: string } | null; sourceUrl: string | null;
  postNames: string | null; examFamily: string | null;
  changes: { id: string; type: string; field: string; before: string | null; after: string; detectedAt: string }[];
}

interface RelatedJob {
  id: string; title: string; org: string; state: string;
  totalVacancies: number | null; applyEnd: string | null; category: string;
}

export default function JobDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [related, setRelated] = useState<RelatedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tracked, setTracked] = useState(false)
  const [tracking, setTracking] = useState(false)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    window.scrollTo(0, 0)
    api.get(`/jobs/${id}`)
      .then((res) => {
        setJob(res.data)
        if (user) checkTracking(id)
        loadRelated(res.data.category, res.data.state, id)
      })
      .catch(() => setError('Failed to load job details'))
      .finally(() => setLoading(false))
  }, [id, user])

  async function loadRelated(category: string, state: string, currentId: string) {
    try {
      const res = await api.get('/jobs', { params: { category, state, limit: 4 } })
      setRelated(res.data.jobs.filter((j: RelatedJob) => j.id !== currentId).slice(0, 3))
    } catch {
      setRelated([])
    }
  }

  useSEO({
    title: job ? `${job.title} - ${job.org}` : 'Loading...',
    description: job ? `${job.title} at ${job.org}. ${job.totalVacancies || ''} vacancies. Apply before ${job.applyEnd || 'deadline'}.` : '',
    canonical: job ? `https://sarakriradar.in/jobs/${job.id}` : undefined,
    ogTitle: job ? `${job.title} | SarkariScout` : undefined,
    ogDescription: job ? `${job.totalVacancies || ''} vacancies at ${job.org}. Free apply link.` : undefined,
    jsonLd: job ? {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      hiringOrganization: { '@type': 'Organization', name: job.org },
      jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressRegion: job.state } },
      employmentType: 'FULL_TIME',
      datePosted: job.applyStart,
      validThrough: job.applyEnd,
      description: job.eligibilityCriteria || job.title,
      baseSalary: job.generalFee ? { '@type': 'MonetaryAmount', value: job.generalFee } : undefined,
    } : undefined,
  })

  async function checkTracking(jobId: string) {
    try {
      const res = await api.get('/jobs/user/tracked')
      setTracked(res.data.some((t: any) => t.jobId === jobId))
    } catch {
      setTracked(false)
    }
  }

  async function toggleTrack() {
    if (!user) { navigate('/login'); return }
    setTracking(true)
    try {
      if (tracked) {
        await api.delete(`/jobs/${id}/track`)
        setTracked(false)
        toast('Job removed from tracker', 'info')
      } else {
        await api.post(`/jobs/${id}/track`, { stage: 'APPLIED' })
        setTracked(true)
        toast('Job added to tracker', 'success')
      }
    } catch {
      toast('Failed to update tracker', 'error')
    }
    finally { setTracking(false) }
  }

  async function shareJob() {
    const url = window.location.href
    const text = `${job?.title} — ${job?.org} | Apply at ${url}`
    if (navigator.share) {
      try { await navigator.share({ title: job?.title, text, url }) } catch {
        // User cancelled share dialog — not an error
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast('Link copied to clipboard', 'success')
      } catch { toast('Could not copy link', 'error') }
    }
  }

  function formatDate(d: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function daysUntil(d: string | null) {
    if (!d) return null
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  }

  if (!id) return <Navigate to="/jobs" replace />

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-600 transition">Home</Link>
          <span>/</span>
          <Link to="/jobs" className="hover:text-blue-600 transition">Jobs</Link>
          {!loading && job && (
            <>
              <span>/</span>
              {job.category && <><Link to={`/jobs?category=${job.category}`} className="hover:text-blue-600 transition">{job.category}</Link><span>/</span></>}
              <span className="text-gray-900 truncate max-w-[200px]">{job.title}</span>
            </>
          )}
        </nav>

        {loading ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
            <div className="h-7 bg-gray-200 rounded w-3/4" />
            <div className="h-5 bg-gray-200 rounded w-1/2" />
            <div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-100 rounded" />)}</div>
            <div className="h-32 bg-gray-100 rounded" />
            <div className="h-24 bg-gray-100 rounded" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">{error}</div>
        ) : job ? (
          <>
            <article className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{job.category}</span>
                    {job.examFamily && <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">{job.examFamily}</span>}
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${job.status === 'OPEN' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{job.status}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-lg text-gray-600 mt-1">{job.org}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={shareJob} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition" title="Share">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  {user && (
                    <button onClick={toggleTrack} disabled={tracking}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tracked ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      {tracking ? '...' : tracked ? '✓ Tracked' : '+ Track'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div><p className="text-xs text-gray-500">Vacancies</p><p className="font-semibold text-gray-900">{job.totalVacancies || '—'}</p></div>
                <div><p className="text-xs text-gray-500">Location</p><p className="font-semibold text-gray-900">{job.state === 'ALL_IN' ? 'All India' : job.state}</p></div>
                <div><p className="text-xs text-gray-500">Fee (Gen/OBC/SC-ST)</p><p className="font-semibold text-gray-900">₹{job.generalFee ?? '—'} / ₹{job.obcFee ?? '—'} / ₹{job.scStFee ?? '—'}</p></div>
                <div><p className="text-xs text-gray-500">Age Limit</p><p className="font-semibold text-gray-900">{job.ageMin || 18}–{job.ageMax || '—'} yrs</p></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-lg"><p className="text-xs text-blue-600 font-medium">Apply Start</p><p className="text-sm font-semibold">{formatDate(job.applyStart)}</p></div>
                <div className={`p-3 rounded-lg ${(daysUntil(job.applyEnd) ?? 99) <= 7 ? 'bg-red-50' : 'bg-orange-50'}`}>
                  <p className={`text-xs font-medium ${(daysUntil(job.applyEnd) ?? 99) <= 7 ? 'text-red-600' : 'text-orange-600'}`}>Last Date to Apply</p>
                  <p className="text-sm font-semibold">{formatDate(job.applyEnd)}</p>
                  {daysUntil(job.applyEnd) !== null && daysUntil(job.applyEnd)! > 0 && (
                    <p className="text-xs text-gray-500">{daysUntil(job.applyEnd)} days left</p>
                  )}
                </div>
                <div className="p-3 bg-purple-50 rounded-lg"><p className="text-xs text-purple-600 font-medium">Exam Date</p><p className="text-sm font-semibold">{formatDate(job.examDate)}</p></div>
              </div>

              {job.postNames && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">Post Names</p>
                  <p className="text-sm text-gray-900">{job.postNames}</p>
                </div>
              )}

              {job.eligibilityCriteria && (
                <div className="mb-6"><h3 className="font-semibold text-gray-900 mb-2">Eligibility Criteria</h3><p className="text-sm text-gray-700 leading-relaxed">{job.eligibilityCriteria}</p></div>
              )}
              {job.howToApply && (
                <div className="mb-6"><h3 className="font-semibold text-gray-900 mb-2">How to Apply</h3><p className="text-sm text-gray-700 leading-relaxed">{job.howToApply}</p></div>
              )}
              {job.selectionProcess && (
                <div className="mb-6"><h3 className="font-semibold text-gray-900 mb-2">Selection Process</h3><p className="text-sm text-gray-700 leading-relaxed">{job.selectionProcess}</p></div>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                {job.applyUrl && (
                  <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm">
                    Apply Now →
                  </a>
                )}
                {job.officialNotificationUrl && (
                  <a href={job.officialNotificationUrl} target="_blank" rel="noopener noreferrer"
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
                    Official Notification
                  </a>
                )}
                {job.sourceUrl && (
                  <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
                    View on {job.source?.name || 'Source'}
                  </a>
                )}
              </div>
            </article>

            {job.changes && job.changes.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <h2 className="font-semibold text-gray-900 mb-3">Recent Changes</h2>
                <div className="space-y-2">
                  {job.changes.map((c) => (
                    <div key={c.id} className="flex items-start gap-3 text-sm">
                      <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full shrink-0">{c.type}</span>
                      <div>
                        <span className="text-gray-600">{c.field}:</span>
                        {c.before && <span className="text-gray-400 line-through ml-1">{c.before}</span>}
                        <span className="text-gray-900 font-medium ml-1">→ {c.after}</span>
                        <span className="text-gray-400 ml-2">{new Date(c.detectedAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {related.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-4">Related Jobs</h2>
                <div className="space-y-3">
                  {related.map((r) => (
                    <Link key={r.id} to={`/jobs/${r.id}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition group">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate group-hover:text-blue-600">{r.title}</p>
                        <p className="text-sm text-gray-500">{r.org}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        {r.applyEnd && <p className="text-xs text-gray-500">Deadline: {new Date(r.applyEnd).toLocaleDateString('en-IN')}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  )
}
