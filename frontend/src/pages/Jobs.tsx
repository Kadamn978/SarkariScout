import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'
import { JobCardSkeleton } from '../components/Skeleton'
import AdBanner from '../components/AdBanner'
import AffiliateCard from '../components/AffiliateCard'

interface Job {
  id: string
  title: string
  organization: string
  location: string
  educationRequired: string
  lastDateToApply: string
  source: { name: string }
}

const PAGE_SIZE = 20

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  const observerRef = useRef<HTMLDivElement>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const fetchJobs = useCallback(async (p: number, q: string, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    setError('')
    try {
      const res = await api.get('/jobs', { params: { search: q, page: p, limit: PAGE_SIZE } })
      const data: Job[] = res.data
      setJobs((prev) => append ? [...prev, ...data] : data)
      setHasMore(data.length === PAGE_SIZE)
    } catch {
      setError('Failed to load jobs')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs(1, search)
    setPage(1)
  }, [search, fetchJobs])

  useEffect(() => {
    const el = observerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
          const next = page + 1
          setPage(next)
          fetchJobs(next, search, true)
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [page, search, hasMore, loading, loadingMore, fetchJobs])

  const handleSearch = (val: string) => {
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => setSearch(val), 300)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Latest Government Jobs</h1>
        <div className="relative mb-6">
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

        <AdBanner slot="XXXXXXXXXX" format="horizontal" className="mb-6" />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">

        {error && <div role="alert" className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

        {loading ? (
          <div className="space-y-4">{[1, 2, 3, 4, 5].map((i) => <JobCardSkeleton key={i} />)}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No jobs found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <>
            <div className="space-y-3" role="list" aria-label="Job listings">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  role="listitem"
                  className="block p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">{job.title}</h2>
                  <p className="text-gray-600 text-sm">{job.organization}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm text-gray-500">
                    <span>{job.location}</span>
                    <span>{job.educationRequired}</span>
                    <span>Deadline: {job.lastDateToApply}</span>
                  </div>
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">{job.source.name}</span>
                </Link>
              ))}
            </div>
            <div ref={observerRef} className="h-4" />
            {loadingMore && <div className="text-center py-4 text-sm text-gray-500">Loading more...</div>}
          </>
        )}
          </div>

          <aside className="w-full lg:w-72 space-y-4">
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
