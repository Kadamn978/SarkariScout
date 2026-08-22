import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'

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

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!job) return <div className="min-h-screen flex items-center justify-center">Job not found</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <Link to="/jobs" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to jobs</Link>
        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
        <p className="text-xl text-gray-600 mb-4">{job.organization}</p>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div><span className="font-medium">Location:</span> {job.location}</div>
          <div><span className="font-medium">Education:</span> {job.educationRequired}</div>
          <div><span className="font-medium">Salary:</span> {job.salaryRange || 'Not specified'}</div>
          <div><span className="font-medium">Last Date:</span> {job.lastDateToApply}</div>
        </div>
        <div className="prose max-w-none mb-6">
          <p>{job.description}</p>
        </div>
        <a
          href={job.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Apply on {job.source.name}
        </a>
      </div>
    </div>
  )
}
