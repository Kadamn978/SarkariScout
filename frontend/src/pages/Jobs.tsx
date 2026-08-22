import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

interface Job {
  id: string
  title: string
  organization: string
  location: string
  educationRequired: string
  lastDateToApply: string
  source: { name: string }
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/jobs', { params: { search, limit: 50 } })
      .then((res) => setJobs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Latest Government Jobs</h1>
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-6"
        />
        {loading ? (
          <p className="text-gray-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500">No jobs found.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold">{job.title}</h2>
                <p className="text-gray-600">{job.organization}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span>{job.location}</span>
                  <span>{job.educationRequired}</span>
                  <span>Last date: {job.lastDateToApply}</span>
                </div>
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                  {job.source.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
