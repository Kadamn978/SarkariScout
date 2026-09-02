import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'
import ScrollReveal from '../components/ScrollReveal'
import TiltCard from '../components/TiltCard'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim',
  'Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
]

const EDUCATION = ['10th Pass','12th Pass','Graduate','Post Graduate','PhD','Diploma','ITI','Medical','Engineering']
const CATEGORIES = ['General','OBC','SC','ST','EWS','PwD']
const LANGUAGES = ['Hindi','English','Marathi','Tamil','Telugu','Bengali','Gujarati','Kannada','Malayalam','Punjabi','Urdu','Assamese','Odia']

export default function Profile() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    education: '', state: '', category: 'General', languages: [] as string[], dateOfBirth: '',
    notifyInstant: true, notifyDigest: true,
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/users/me')
      .then((res) => {
        const p = res.data
        setForm({
          education: p.educationLevel || '',
          state: p.state || '',
          category: p.category || 'General',
          languages: p.languages ? p.languages.split(',').map((l: string) => l.trim()) : [],
          dateOfBirth: p.dob ? p.dob.split('T')[0] : '',
          notifyInstant: p.notifyInstant ?? true,
          notifyDigest: p.notifyDigest ?? true,
        })
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const toggleLang = (lang: string) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.education || !form.state) { setError('Education and State are required'); return }
    setError('')
    setLoading(true)
    try {
      await api.put('/users/me', {
        educationLevel: form.education,
        state: form.state,
        category: form.category,
        languages: form.languages.join(', '),
        dob: form.dateOfBirth || undefined,
        notifyInstant: form.notifyInstant,
        notifyDigest: form.notifyDigest,
      })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="space-y-3 mt-6">
              {[1,2,3].map((i) => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-2xl mx-auto py-6 sm:py-8 px-4">
        <ScrollReveal>
          <TiltCard className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">Your Profile</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Update your details to get personalized job alerts.</p>
          {error && <div role="alert" className="p-3 mb-4 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="edu" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Education *</label>
              <select id="edu" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} required className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="">Select education</option>
                {EDUCATION.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
              <select id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="">Select state</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
              <input id="dob" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Languages Known</legend>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Language selection">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLang(lang)}
                    aria-pressed={form.languages.includes(lang)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      form.languages.includes(lang)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">Notification Preferences</legend>
              <div className="space-y-3 mt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notifyInstant}
                    onChange={(e) => setForm({ ...form, notifyInstant: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Instant Alerts</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get notified immediately when a job changes or a new match is found</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notifyDigest}
                    onChange={(e) => setForm({ ...form, notifyDigest: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Digest</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Receive a daily email with all matching jobs</p>
                  </div>
                </label>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </TiltCard>
        </ScrollReveal>
      </main>
    </div>
  )
}
