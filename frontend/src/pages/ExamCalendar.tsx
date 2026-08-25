import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'

interface CalendarJob {
  id: string; title: string; org: string; state: string;
  applyStart: string | null; applyEnd: string | null; feePaymentEnd: string | null;
  examDate: string | null; admitCardDate: string | null; resultDate: string | null;
  totalVacancies: number | null; category: string;
}

type ViewMode = 'timeline' | 'month'

export default function ExamCalendar() {
  const [jobs, setJobs] = useState<CalendarJob[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('timeline')
  const [filter, setFilter] = useState<'all' | 'apply' | 'exam' | 'result'>('all')

  useEffect(() => { loadJobs() }, [])

  async function loadJobs() {
    try {
      const res = await api.get('/jobs?limit=100&status=OPEN')
      setJobs(res.data.jobs)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function getEvents() {
    const events: { date: Date; type: string; job: CalendarJob; label: string; color: string }[] = []
    for (const job of jobs) {
      if (job.applyStart) events.push({ date: new Date(job.applyStart), type: 'apply', job, label: 'Applications Open', color: 'bg-green-500' })
      if (job.feePaymentEnd) events.push({ date: new Date(job.feePaymentEnd), type: 'fee', job, label: 'Fee Payment Deadline', color: 'bg-orange-500' })
      if (job.applyEnd) events.push({ date: new Date(job.applyEnd), type: 'apply', job, label: 'Last Date to Apply', color: 'bg-red-500' })
      if (job.admitCardDate) events.push({ date: new Date(job.admitCardDate), type: 'exam', job, label: 'Admit Card Available', color: 'bg-purple-500' })
      if (job.examDate) events.push({ date: new Date(job.examDate), type: 'exam', job, label: 'Exam Date', color: 'bg-blue-600' })
      if (job.resultDate) events.push({ date: new Date(job.resultDate), type: 'result', job, label: 'Result Expected', color: 'bg-yellow-500' })
    }
    return events
      .filter((e) => filter === 'all' || e.type === filter)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  function formatDate(d: Date) {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function daysUntil(d: Date) {
    const diff = Math.ceil((d.getTime() - Date.now()) / 86400000)
    return diff
  }

  function groupByMonth(events: ReturnType<typeof getEvents>) {
    const groups: Record<string, typeof events> = {}
    for (const e of events) {
      const key = e.date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      if (!groups[key]) groups[key] = []
      groups[key].push(e)
    }
    return groups
  }

  const events = getEvents()
  const upcoming = events.filter((e) => e.date.getTime() >= Date.now()).slice(0, 20)
  const groups = groupByMonth(upcoming)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Exam Calendar 2026</h1>
            <p className="text-gray-500 mt-1">All important dates for government exams in one place</p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['all', 'apply', 'exam', 'result'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition capitalize ${filter === f ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl animate-pulse flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0" />
              <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
            </div>
          ))}</div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl"><p className="text-gray-500">No upcoming events found.</p></div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groups).map(([month, monthEvents]) => (
              <div key={month}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  {month}
                </h2>
                <div className="space-y-2">
                  {monthEvents.map((event, idx) => {
                    const diff = daysUntil(event.date)
                    return (
                      <Link key={idx} to={`/jobs/${event.job.id}`}
                        className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md hover:border-blue-200 transition group">
                        <div className="text-center shrink-0 w-16">
                          <p className="text-2xl font-bold text-gray-900">{event.date.getDate()}</p>
                          <p className="text-xs text-gray-500">{event.date.toLocaleDateString('en-IN', { month: 'short' })}</p>
                        </div>
                        <div className={`w-1 self-stretch rounded-full ${event.color} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate group-hover:text-blue-600">{event.job.title}</p>
                          <p className="text-sm text-gray-500">{event.job.org}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{event.label}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          {diff > 0 ? (
                            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${diff <= 7 ? 'bg-red-100 text-red-700' : diff <= 30 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                              {diff}d
                            </span>
                          ) : diff === 0 ? (
                            <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Today</span>
                          ) : (
                            <span className="text-sm text-gray-400">Passed</span>
                          )}
                          <p className="text-xs text-gray-400 mt-1">{formatDate(event.date)}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
