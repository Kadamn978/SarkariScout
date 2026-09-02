import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'
import { useSEO } from '../hooks/useSEO'

interface CalendarJob {
  id: string; title: string; org: string; state: string;
  applyStart: string | null; applyEnd: string | null; feePaymentEnd: string | null;
  examDate: string | null; admitCardDate: string | null; resultDate: string | null;
  totalVacancies: number | null; category: string;
}

type ViewMode = 'list' | 'grid' | 'calendar'

interface Event {
  date: Date; type: string; job: CalendarJob; label: string; colorClass: string
}

export default function ExamCalendar() {
  useSEO({
    title: 'Government Exam Calendar',
    description: 'View all upcoming government exam dates, application deadlines, admit card releases, and result declarations on a single calendar.',
    canonical: 'https://rozgarscout.in/exam-calendar',
    ogTitle: 'Exam Calendar | RozgarScout',
    ogDescription: 'Government exam calendar with all important dates in one view.',
  })

  const [jobs, setJobs] = useState<CalendarJob[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('list')
  const [filter, setFilter] = useState<'all' | 'apply' | 'exam' | 'result'>('all')
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [modalDate, setModalDate] = useState<Event[] | null>(null)

  useEffect(() => { loadJobs() }, [])

  async function loadJobs() {
    try {
      const res = await api.get('/jobs?limit=200&status=OPEN')
      setJobs(Array.isArray(res.data.jobs) ? res.data.jobs : [])
    } catch (e) { /* console.error(e) */ }
    finally { setLoading(false) }
  }

  const events = useMemo(() => {
    const all: Event[] = []
    for (const job of jobs) {
      if (job.applyStart) all.push({ date: new Date(job.applyStart), type: 'apply', job, label: 'Applications Open', colorClass: 'bg-green-500' })
      if (job.feePaymentEnd) all.push({ date: new Date(job.feePaymentEnd), type: 'fee', job, label: 'Fee Payment Deadline', colorClass: 'bg-orange-500' })
      if (job.applyEnd) all.push({ date: new Date(job.applyEnd), type: 'apply', job, label: 'Last Date to Apply', colorClass: 'bg-red-500' })
      if (job.admitCardDate) all.push({ date: new Date(job.admitCardDate), type: 'exam', job, label: 'Admit Card Available', colorClass: 'bg-purple-500' })
      if (job.examDate) all.push({ date: new Date(job.examDate), type: 'exam', job, label: 'Exam Date', colorClass: 'bg-blue-600' })
      if (job.resultDate) all.push({ date: new Date(job.resultDate), type: 'result', job, label: 'Result Expected', colorClass: 'bg-yellow-500' })
    }
    return all
      .filter((e) => filter === 'all' || e.type === filter)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [jobs, filter])

  const upcoming = useMemo(() => events.filter((e) => e.date.getTime() >= Date.now()).slice(0, 50), [events])

  const groups = useMemo(() => {
    const g: Record<string, Event[]> = {}
    for (const e of upcoming) {
      const key = e.date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      if (!g[key]) g[key] = []
      g[key].push(e)
    }
    return g
  }, [upcoming])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1)
    const lastDay = new Date(calYear, calMonth + 1, 0)
    const startPad = (firstDay.getDay()) % 7
    const days: { date: Date; events: Event[]; isCurrentMonth: boolean }[] = []
    for (let i = -startPad; i < 0; i++) {
      const d = new Date(calYear, calMonth, i + 1)
      days.push({ date: d, events: events.filter((e) => isSameDay(e.date, d)), isCurrentMonth: false })
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(calYear, calMonth, i)
      days.push({ date: d, events: events.filter((e) => isSameDay(e.date, d)), isCurrentMonth: true })
    }
    while (days.length < 42) {
      const d = new Date(calYear, calMonth, days.length - startPad + 1)
      days.push({ date: d, events: events.filter((e) => isSameDay(e.date, d)), isCurrentMonth: false })
    }
    return days
  }, [calMonth, calYear, events])

  function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  }

  function daysUntil(d: Date) {
    return Math.ceil((d.getTime() - Date.now()) / 86400000)
  }

  function getUrgencyClass(d: Date) {
    const diff = daysUntil(d)
    if (diff <= 3) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    if (diff <= 14) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  }

  function formatDate(d: Date) {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Exam Calendar</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">All important dates for government exams in one place</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {(['all', 'apply', 'exam', 'result'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition capitalize ${filter === f ? 'bg-white shadow text-gray-900 dark:bg-gray-700 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {([
                { key: 'list' as ViewMode, icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
                { key: 'grid' as ViewMode, icon: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z' },
                { key: 'calendar' as ViewMode, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              ]).map((v) => (
                <button key={v.key} onClick={() => setView(v.key)}
                  className={`p-2 rounded-md transition ${view === v.key ? 'bg-white shadow text-blue-600 dark:bg-gray-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                  title={v.key.charAt(0).toUpperCase() + v.key.slice(1)}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={v.icon} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl animate-pulse flex gap-4 dark:bg-gray-900">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0" />
              <div className="flex-1"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" /></div>
            </div>
          ))}</div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No upcoming events found.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Events will appear here as jobs are added.</p>
          </div>
        ) : view === 'list' ? (
          <div className="space-y-8">
            {Object.entries(groups).map(([month, monthEvents]) => (
              <div key={month}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  {month}
                </h2>
                <div className="space-y-2">
                  {monthEvents.map((event, idx) => {
                    const diff = daysUntil(event.date)
                    return (
                      <Link key={idx} to={`/jobs/${event.job.id}`}
                        className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md hover:border-blue-200 transition group dark:bg-gray-900 dark:border-gray-800">
                        <div className="text-center shrink-0 w-16">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{event.date.getDate()}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{event.date.toLocaleDateString('en-IN', { month: 'short' })}</p>
                        </div>
                        <div className={`w-1 self-stretch rounded-full ${event.colorClass} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600">{event.job.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{event.job.org}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{event.label}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          {diff > 0 ? (
                            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${getUrgencyClass(event.date)}`}>
                              {diff}d
                            </span>
                          ) : diff === 0 ? (
                            <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Today</span>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">Passed</span>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(event.date)}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((event, idx) => {
              const diff = daysUntil(event.date)
              return (
                <Link key={idx} to={`/jobs/${event.job.id}`}
                  className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-lg hover:border-blue-200 transition group dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-3 h-3 rounded-full ${event.colorClass} shrink-0`} />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{event.label}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 mb-1 line-clamp-2">{event.job.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{event.job.org}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatDate(event.date)}</span>
                    {diff > 0 ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getUrgencyClass(event.date)}`}>{diff}d left</span>
                    ) : diff === 0 ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Today</span>
                    ) : null}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) } else setCalMonth(calMonth - 1) }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{MONTH_NAMES[calMonth]} {calYear}</h2>
              <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) } else setCalMonth(calMonth + 1) }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-7">
              {DAY_NAMES.map((d) => (
                <div key={d} className="p-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => (
                <button key={idx} onClick={() => day.events.length > 0 && setModalDate(day.events)}
                  className={`relative min-h-[72px] p-1.5 border-b border-r border-gray-50 dark:border-gray-800 text-left transition
                    ${day.isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-950'}
                    ${day.events.length > 0 ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20' : ''}
                    ${isSameDay(day.date, new Date()) ? 'ring-2 ring-blue-500 ring-inset' : ''}
                  `}>
                  <span className={`text-xs font-medium ${day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                    {day.date.getDate()}
                  </span>
                  {day.events.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {day.events.slice(0, 3).map((e, i) => (
                        <span key={i} className={`w-1.5 h-1.5 rounded-full ${e.colorClass}`} />
                      ))}
                      {day.events.length > 3 && <span className="text-[9px] text-gray-500 dark:text-gray-400">+{day.events.length - 3}</span>}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {modalDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalDate(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">{modalDate[0]?.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setModalDate(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-4 space-y-2">
                {modalDate.map((event, i) => (
                  <Link key={i} to={`/jobs/${event.job.id}`} onClick={() => setModalDate(null)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <span className={`w-3 h-3 rounded-full ${event.colorClass} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{event.job.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{event.job.org} · {event.label}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${getUrgencyClass(event.date)}`}>
                      {daysUntil(event.date) > 0 ? `${daysUntil(event.date)}d` : 'Today'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-6 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Applications Open</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Last Date to Apply</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Fee Deadline</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Admit Card</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Exam Date</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Result Expected</span>
        </div>
      </main>
    </div>
  )
}
