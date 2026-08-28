import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

interface Preferences {
  digestEnabled: boolean
  instantEnabled: boolean
  weeklyEnabled: boolean
  digestTime: string
}

interface Notification {
  id: string
  type: string
  subject: string
  sentAt: string
  status: string
  openedAt: string | null
  job: { title: string; org: string } | null
}

export default function EmailPreferences() {
  const [prefs, setPrefs] = useState<Preferences | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'preferences' | 'history'>('preferences')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [prefsRes, notifRes] = await Promise.all([
        api.get('/email/preferences'),
        api.get('/email/notifications'),
      ])
      setPrefs(prefsRes.data || { digestEnabled: true, instantEnabled: false, weeklyEnabled: true, digestTime: '09:05' })
      setNotifications(notifRes.data || [])
    } catch (e) {
      /* console.error('Failed to load', e) */
    } finally {
      setLoading(false)
    }
  }

  async function savePrefs(newPrefs: Partial<Preferences>) {
    if (!prefs) return
    const updated = { ...prefs, ...newPrefs }
    setPrefs(updated)
    setSaving(true)
    try {
      await api.put('/email/preferences', updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      /* console.error('Failed to save', e) */
      setPrefs(prefs)
    } finally {
      setSaving(false)
    }
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function getTypeBadge(type: string) {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      DIGEST: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Daily Digest' },
      INSTANT: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Instant Alert' },
      CHANGE_ALERT: { bg: 'bg-red-50', text: 'text-red-700', label: 'Change Alert' },
      WELCOME: { bg: 'bg-green-50', text: 'text-green-700', label: 'Welcome' },
    }
    const badge = map[type] || { bg: 'bg-gray-50', text: 'text-gray-700', label: type }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-700">← Back to Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Email Settings</h1>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab('preferences')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${tab === 'preferences' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
          >
            Preferences
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${tab === 'history' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
          >
            Notification History ({notifications.length})
          </button>
        </div>

        {tab === 'preferences' && prefs && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Daily Digest</h3>
                  <p className="text-sm text-gray-500">Get a daily email with jobs matching your profile</p>
                </div>
                <button
                  onClick={() => savePrefs({ digestEnabled: !prefs.digestEnabled })}
                  className={`relative w-12 h-6 rounded-full transition ${prefs.digestEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition ${prefs.digestEnabled ? 'translate-x-6' : ''}`} />
                </button>
              </div>
              {prefs.digestEnabled && (
                <div className="mt-4 flex items-center gap-3">
                  <label className="text-sm text-gray-600">Send at:</label>
                  <input
                    type="time"
                    value={prefs.digestTime}
                    onChange={(e) => savePrefs({ digestTime: e.target.value })}
                    className="border rounded-lg px-3 py-1.5 text-sm"
                  />
                  <span className="text-xs text-gray-400">IST</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Instant Alerts</h3>
                  <p className="text-sm text-gray-500">Get notified immediately when tracked jobs change</p>
                </div>
                <button
                  onClick={() => savePrefs({ instantEnabled: !prefs.instantEnabled })}
                  className={`relative w-12 h-6 rounded-full transition ${prefs.instantEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition ${prefs.instantEnabled ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Weekly Summary</h3>
                  <p className="text-sm text-gray-500">Get a weekly summary of new jobs and deadlines</p>
                </div>
                <button
                  onClick={() => savePrefs({ weeklyEnabled: !prefs.weeklyEnabled })}
                  className={`relative w-12 h-6 rounded-full transition ${prefs.weeklyEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition ${prefs.weeklyEnabled ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>

            {saved && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 text-center">
                Settings saved successfully!
              </div>
            )}
            {saving && (
              <div className="text-center text-sm text-gray-400">Saving...</div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div>
            {notifications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <p className="text-gray-500">No notifications yet.</p>
                <p className="text-sm text-gray-400 mt-1">You'll see your email history here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeBadge(n.type)}
                        <span className="text-xs text-gray-400">{formatTime(n.sentAt)}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{n.subject}</p>
                      {n.job && <p className="text-xs text-gray-500">{n.job.org} — {n.job.title}</p>}
                    </div>
                    <div className="shrink-0 text-xs text-gray-400">
                      {n.openedAt ? (
                        <span className="text-green-600">Opened</span>
                      ) : (
                        <span>Sent</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
