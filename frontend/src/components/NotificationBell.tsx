import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

interface Notification {
  id: string; type: string; title: string; message: string;
  jobId?: string; read: boolean; createdAt: string;
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!user) return
    loadNotifications()
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function loadNotifications() {
    try {
      const res = await api.get('/jobs/user/tracked')
      const tracked = res.data
      const alerts: Notification[] = []
      for (const t of tracked.slice(0, 10)) {
        if (t.job?.applyEnd) {
          const diff = Math.ceil((new Date(t.job.applyEnd).getTime() - Date.now()) / 86400000)
          if (diff <= 7 && diff > 0) {
            alerts.push({
              id: t.jobId, type: 'deadline', title: 'Deadline Approaching',
              message: `${t.job.title} — ${diff} days left`,
              jobId: t.jobId, read: false, createdAt: new Date().toISOString(),
            })
          }
        }
      }
      setNotifications(alerts)
    } catch {
      setNotifications([])
    }
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  if (!user) return null

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700">Mark all read</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-400 text-sm">No notifications yet</p>
                <p className="text-gray-300 text-xs mt-1">Track jobs to get alerts</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link key={n.id} to={n.jobId ? `/jobs/${n.jobId}` : '#'}
                  onClick={() => setOpen(false)}
                  className={`block p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${!n.read ? 'bg-blue-50/30' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          <Link to="/dashboard" onClick={() => setOpen(false)}
            className="block p-3 text-center text-sm text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
            View Dashboard
          </Link>
        </div>
      )}
    </div>
  )
}
