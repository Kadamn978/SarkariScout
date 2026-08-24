import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import Navbar from '../components/Navbar'

interface TrackedJob {
  id: string
  jobId: string
  stage: string | null
  applied: boolean
  createdAt: string
  job: {
    id: string
    title: string
    org: string
    state: string
    applyEnd: string | null
    status: string
  }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/jobs/user/tracked')
      .then((res) => setTrackedJobs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const appliedCount = trackedJobs.filter((t) => t.applied).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome back, {user?.name || user?.email}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Tracked Jobs</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{trackedJobs.length}</p>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Applied</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{appliedCount}</p>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-2xl sm:text-3xl font-bold text-orange-600">{trackedJobs.length - appliedCount}</p>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <Link to="/jobs" className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
            Browse Jobs
          </Link>
          <Link to="/profile" className="inline-block px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
            Edit Profile
          </Link>
        </div>

        <h2 className="text-lg font-semibold mb-4">Your Tracked Jobs</h2>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse">
              <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
            </div>
          ))}</div>
        ) : trackedJobs.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-gray-500 mb-2">No tracked jobs yet</p>
            <p className="text-gray-400 text-sm">Browse jobs and click "Track" to save them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trackedJobs.map((t) => (
              <Link
                key={t.id}
                to={`/jobs/${t.job.id}`}
                className="block bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{t.job.title}</h3>
                    <p className="text-sm text-gray-600">{t.job.org} &middot; {t.job.state}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.applied && (
                      <span className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded-full">Applied</span>
                    )}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      t.job.status === 'OPEN' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {t.job.status}
                    </span>
                  </div>
                </div>
                {t.job.applyEnd && (
                  <p className="text-xs text-gray-500 mt-1">Deadline: {new Date(t.job.applyEnd).toLocaleDateString()}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
