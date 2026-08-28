import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import ScrollReveal from '../components/ScrollReveal'
import TiltCard from '../components/TiltCard'

interface TrackedJob {
  id: string; jobId: string; stage: string | null;
  job: { id: string; title: string; org: string; state: string; applyEnd: string | null; status: string; totalVacancies: number | null; };
  createdAt: string;
}

interface DeadlineJob {
  id: string; title: string; org: string; applyEnd: string; totalVacancies: number | null; state: string;
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>([])
  const [deadlines, setDeadlines] = useState<DeadlineJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/jobs/user/tracked').catch(() => ({ data: [] })),
      api.get('/jobs/upcoming?days=14').catch(() => ({ data: [] })),
    ]).then(([tracked, upcoming]) => {
      setTrackedJobs(tracked.data)
      setDeadlines(upcoming.data)
    }).finally(() => setLoading(false))
  }, [])

  function daysUntil(dateStr: string) {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
    return diff
  }

  const stageColors: Record<string, string> = {
    INTERESTED: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    APPLIED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    EXAM_PREP: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    EXAM_DONE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    SELECTED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition" aria-label="Go back">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.name || user?.email}</p>
            </div>
          </div>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition">
              Admin Panel
            </Link>
          )}
        </div>

        {/* Quick Stats */}
        <ScrollReveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <TiltCard className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
              <p className="text-3xl font-black text-blue-600">{trackedJobs.length}</p>
              <p className="text-sm text-gray-500 mt-1">Tracked Jobs</p>
            </TiltCard>
            <TiltCard className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-purple-200 transition-all duration-300">
              <p className="text-3xl font-black text-purple-600">11</p>
              <p className="text-sm text-gray-500 mt-1">Mock Tests</p>
            </TiltCard>
            <TiltCard className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-green-200 transition-all duration-300">
              <p className="text-3xl font-black text-green-600">20</p>
              <p className="text-sm text-gray-500 mt-1">Papers</p>
            </TiltCard>
            <TiltCard className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-orange-200 transition-all duration-300">
              <p className="text-3xl font-black text-orange-600">{deadlines.length}</p>
              <p className="text-sm text-gray-500 mt-1">Expiring Soon</p>
            </TiltCard>
          </div>
        </ScrollReveal>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link to="/jobs" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Browse Jobs
          </Link>
          <Link to="/profile" className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            Edit Profile
          </Link>
          <Link to="/email-preferences" className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            Email Settings
          </Link>
          <Link to="/documents" className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            My Documents
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tracked Jobs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Tracked Jobs</h2>
              <Link to="/jobs" className="text-sm text-blue-600 hover:text-blue-700">Find More →</Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 animate-pulse">
                    <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : trackedJobs.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 p-10 rounded-xl text-center border border-gray-100 dark:border-gray-800">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-gray-900 dark:text-white font-medium mb-1">No tracked jobs yet</p>
                <p className="text-gray-400 dark:text-gray-400 text-sm mb-4">Browse jobs and click Track to save them here</p>
                <Link to="/jobs" className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {trackedJobs.slice(0, 10).map((t) => (
                  <Link key={t.id} to={`/jobs/${t.job.id}`}
                    className="block bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-blue-200 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{t.job.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.job.org} · {t.job.state === 'ALL_IN' ? 'All India' : t.job.state}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {t.stage && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${stageColors[t.stage] || 'bg-gray-100 text-gray-700'}`}>
                            {t.stage.replace('_', ' ')}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded-full ${t.job.status === 'OPEN' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {t.job.status}
                        </span>
                      </div>
                    </div>
                    {t.job.applyEnd && (
                      <p className="text-xs text-gray-400 mt-2">
                        Deadline: {new Date(t.job.applyEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {daysUntil(t.job.applyEnd) <= 7 && (
                          <span className={`ml-2 font-medium ${daysUntil(t.job.applyEnd) <= 3 ? 'text-red-600' : 'text-orange-500'}`}>
                            ({daysUntil(t.job.applyEnd)} days left)
                          </span>
                        )}
                      </p>
                    )}
                  </Link>
                ))}
                {trackedJobs.length > 10 && (
                  <p className="text-center text-sm text-gray-400 py-2">+ {trackedJobs.length - 10} more tracked jobs</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Expiring Deadlines */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Expiring Deadlines</h2>
              {deadlines.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl text-center border border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-400">No upcoming deadlines</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {deadlines.slice(0, 6).map((job) => (
                    <Link key={job.id} to={`/jobs/${job.id}`}
                      className="block bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:shadow-sm transition">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{job.org}</span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${daysUntil(job.applyEnd) <= 3 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {daysUntil(job.applyEnd)}d
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Completion */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/mock-tests" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm">
                  <span className="text-lg">📝</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Take a Mock Test</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">11 tests available</p>
                  </div>
                </Link>
                <Link to="/papers" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm">
                  <span className="text-lg">📄</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Practice Papers</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">20 previous year papers</p>
                  </div>
                </Link>
                <Link to="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm">
                  <span className="text-lg">👤</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Complete Your Profile</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get better job matches</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
