import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'
import { useToast } from '../contexts/ToastContext'
import { JobCardSkeleton } from '../components/Skeleton'
import ScrollReveal from '../components/ScrollReveal'
import TiltCard from '../components/TiltCard'

interface Job {
  id: string
  title: string
  org: string
  state: string
  examFamily: string | null
  applyEnd: string | null
  totalVacancies: number | null
  source: { name: string } | null
}

interface JobsResponse {
  jobs: Job[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const INDIAN_STATES = [
  'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Delhi', 'Karnataka',
  'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'West Bengal',
  'Andhra Pradesh', 'Telangana', 'Kerala', 'Punjab', 'Haryana',
]

const CATEGORIES = ['GOVERNMENT', 'BANKING', 'RAILWAY', 'ENGINEERING', 'DEFENCE', 'PSU', 'POLICE', 'IT', 'TEACHING', 'MEDICAL', 'INTERNSHIP']

const QUALIFICATIONS = ['10th Pass', '12th Pass', 'Graduate', 'Engineering', 'Diploma', 'ITI', 'Post Graduate']

const PAGE_SIZE = 20

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [state, setState] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const observerRef = useRef<HTMLDivElement>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const fetchJobs = useCallback(async (p: number, q: string, st: string, cat: string, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    setError('')
    try {
      const params: Record<string, any> = { page: p, limit: PAGE_SIZE }
      if (q) params.search = q
      if (st) params.state = st
      if (cat) params.category = cat
      const res = await api.get('/jobs', { params })
      const data: JobsResponse = res.data
      setJobs((prev) => append ? [...prev, ...data.jobs] : data.jobs)
      setHasMore(data.jobs.length === PAGE_SIZE)
    } catch {
      setError('Failed to load jobs')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs(1, search, state, category)
    setPage(1)
  }, [search, state, category, fetchJobs])

  useEffect(() => {
    const el = observerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
          const next = page + 1
          setPage(next)
          fetchJobs(next, search, state, category, true)
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [page, search, state, hasMore, loading, loadingMore, fetchJobs])

  useEffect(() => {
    api.get('/jobs/user/tracked').then((res) => {
      const ids = new Set<string>(res.data.map((t: any) => t.jobId))
      setTrackedIds(ids)
    }).catch(() => {})
  }, [])

  const handleSearch = (val: string) => {
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => setSearch(val), 300)
  }

  const handleTrack = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.post(`/jobs/${jobId}/track`)
      setTrackedIds((prev) => new Set(prev).add(jobId))
      toast('Job tracked successfully', 'success')
    } catch {
      toast('Failed to track job', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-600 transition">Home</Link>
          <span>/</span>
          <span className="text-gray-900">Jobs</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Latest Government Jobs</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <label htmlFor="job-search" className="sr-only">Search jobs</label>
            <input
              id="job-search"
              type="search"
              placeholder="Search by title, organization..."
              maxLength={200}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select value={state} onChange={(e) => setState(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
            <option value="">All States</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <AdBanner slot="XXXXXXXXXX" format="horizontal" className="mb-6" />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">

        {error && <div role="alert" className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

        {loading ? (
          <div className="space-y-4">{[1, 2, 3, 4, 5].map((i) => <JobCardSkeleton key={i} />)}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No jobs found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="space-y-3" role="list" aria-label="Job listings">
              {jobs.map((job, i) => (
                <ScrollReveal key={job.id} delay={i * 40} direction="up">
                <Link
                  to={`/jobs/${job.id}`}
                  role="listitem"
                  className="block p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover-lift card-shine focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900">{job.title}</h2>
                      <p className="text-gray-600 text-sm">{job.org}</p>
                    </div>
                    <button
                      onClick={(e) => handleTrack(job.id, e)}
                      className={`ml-3 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex-shrink-0 ${
                        trackedIds.has(job.id)
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      {trackedIds.has(job.id) ? 'Tracked' : 'Track'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm text-gray-500">
                    <span>{job.state === 'ALL_IN' ? 'All India' : job.state}</span>
                    {job.totalVacancies && <span>{job.totalVacancies} vacancies</span>}
                    {job.applyEnd && <span>Deadline: {new Date(job.applyEnd).toLocaleDateString()}</span>}
                  </div>
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">{job.source?.name || 'Unknown'}</span>
                </Link>
                </ScrollReveal>
              ))}
            </div>
            <div ref={observerRef} className="h-4" />
            {loadingMore && <div className="text-center py-4 text-sm text-gray-500">Loading more...</div>}
          </>
        )}
          </div>

          <aside className="w-full lg:w-72 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Jobs by State</h3>
              <div className="space-y-1">
                {INDIAN_STATES.filter(s => s !== 'ALL_IN').slice(0, 8).map((s) => (
                  <Link key={s} to={`/state/${s}`} className="block text-sm text-blue-600 hover:underline">{s.replace(/_/g, ' ')}</Link>
                ))}
                <Link to="/state/ALL_IN" className="block text-sm text-blue-600 hover:underline font-medium">View All States</Link>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Jobs by Qualification</h3>
              <div className="space-y-1">
                {QUALIFICATIONS.map((q) => (
                  <Link key={q} to={`/qualifications/${q.toLowerCase().replace(/\s+/g, '-')}`} className="block text-sm text-blue-600 hover:underline">{q} Pass</Link>
                ))}
              </div>
            </div>
            <AdBanner slot="XXXXXXXXXX" format="vertical" className="sticky top-20" />
            <AffiliateCard
              title="Best Books for Govt Exams"
              description="Top-rated study material for SSC, UPSC, Banking exams"
              url="https://example.com/affiliate/books"
              cta="Shop Now"
            />
            <AffiliateCard
              title="Online Coaching"
              description="Live classes by top educators for government exam preparation"
              url="https://example.com/affiliate/coaching"
              cta="Enroll Now"
            />
          </aside>
        </div>
      </main>
    </div>
  )
}
