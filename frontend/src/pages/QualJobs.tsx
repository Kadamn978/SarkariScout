import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'
import { useSEO } from '../hooks/useSEO'
import { JobCardSkeleton } from '../components/Skeleton'
import AdBanner from '../components/AdBanner'
import AffiliateCard from '../components/AffiliateCard'

interface Job {
  id: string
  title: string
  org: string
  state: string
  applyEnd: string | null
  totalVacancies: number | null
  qualificationLevels: string | null
  source: { name: string } | null
}

const QUAL_NAMES: Record<string, string> = {
  '10th': '10th Pass',
  '12th': '12th Pass',
  Graduate: 'Graduate',
  'Post Graduate': 'Post Graduate',
  Engineering: 'Engineering',
  Diploma: 'Diploma',
  ITI: 'ITI',
  '8th': '8th Pass',
}

export default function QualJobs() {
  const { qual } = useParams()
  useSEO({
    title: `Government Jobs for ${qual?.replace(/-/g, ' ') || ''} Candidates`,
    description: `Browse government jobs for ${qual?.replace(/-/g, ' ') || ''} qualified candidates. Filter by state and category.`,
    canonical: qual ? `https://rozgarscout.in/qualifications/${qual}` : undefined,
  })

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const qualName = QUAL_NAMES[qual || ''] || qual?.replace(/-/g, ' ') || 'Unknown'

  useEffect(() => {
    if (!qual) return
    setLoading(true)
    api.get('/jobs', { params: { search: qualName, limit: 50 } })
      .then((res) => {
        setJobs(res.data.jobs || [])
        setTotal(res.data.total || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [qual, qualName])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <Link to="/jobs" className="inline-flex items-center text-blue-600 hover:underline text-sm mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          All Jobs
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{qualName} Government Jobs 2026</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{total} active jobs for {qualName} candidates</p>

        <AdBanner slot="XXXXXXXXXX" format="horizontal" className="mb-6" />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            {loading ? (
              <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <JobCardSkeleton key={i} />)}</div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg dark:bg-gray-900">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No jobs found for {qualName}</p>
                <Link to="/jobs" className="text-blue-600 hover:underline mt-2 inline-block">View all jobs</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="block p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all dark:bg-gray-900 dark:border-gray-800">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{job.org}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <span>{job.state?.replace(/_/g, ' ')}</span>
                      {job.totalVacancies && <span>{job.totalVacancies} vacancies</span>}
                      {job.applyEnd && <span>Deadline: {new Date(job.applyEnd).toLocaleDateString()}</span>}
                    </div>
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">{job.source?.name || 'Unknown'}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <aside className="w-full lg:w-72 space-y-4">
            <AdBanner slot="XXXXXXXXXX" format="vertical" className="sticky top-20" />
            <AffiliateCard
              title={`Best Books for ${qualName} Exams`}
              description="Top-rated study material for your qualification level"
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
