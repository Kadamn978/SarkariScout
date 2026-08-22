import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'
import { Skeleton } from '../components/Skeleton'

interface Job {
  id: string
  title: string
  organization: string
  location: string
  educationRequired: string
  lastDateToApply: string
  salaryRange: string
  description: string
  source: { name: string; url: string }
}

export default function JobDetail() {
  const { id } = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch(() => setError('Failed to load job'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <Link to="/jobs" className="inline-flex items-center text-blue-600 hover:underline text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to jobs
        </Link>

        {loading ? (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm space-y-4">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <div className="grid grid-cols-2 gap-4"><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /></div>
            <Skeleton className="h-24" />
          </div>
        ) : error ? (
          <div role="alert" className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
        ) : job ? (
          <article className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{job.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{job.organization}</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 text-sm">
              <div><dt className="font-medium text-gray-500">Location</dt><dd className="text-gray-900">{job.location}</dd></div>
              <div><dt className="font-medium text-gray-500">Education</dt><dd className="text-gray-900">{job.educationRequired}</dd></div>
              <div><dt className="font-medium text-gray-500">Salary</dt><dd className="text-gray-900">{job.salaryRange || 'Not specified'}</dd></div>
              <div><dt className="font-medium text-gray-500">Last Date</dt><dd className="text-gray-900">{job.lastDateToApply}</dd></div>
            </dl>
            {job.description && <div className="prose prose-sm max-w-none text-gray-700 mb-6"><p>{job.description}</p></div>}
            <a
              href={job.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Apply on {job.source.name}
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </article>
        ) : null}
      </main>
    </div>
  )
}
