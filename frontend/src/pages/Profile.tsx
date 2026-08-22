import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

const STATES = [
  'Andhra Pradesh','Bihar','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh',
  'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha',
  'Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'
]

const EDUCATION = [
  '10th Pass','12th Pass','Graduate','Post Graduate','PhD','Diploma','ITI'
]

const CATEGORIES = ['General','OBC','SC','ST','EWS']

const LANGUAGES = ['Hindi','English','Marathi','Tamil','Telugu','Bengali','Gujarati','Kannada','Malayalam','Punjabi','Urdu']

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    education: '',
    state: '',
    category: 'General',
    languages: [] as string[],
    dateOfBirth: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    setError('')
    setLoading(true)
    try {
      await api.post('/users/profile', form)
      navigate('/jobs')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
        <p className="text-gray-600 mb-6">Tell us about yourself to get personalized job alerts.</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Education</label>
            <select
              value={form.education}
              onChange={(e) => setForm({ ...form, education: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="">Select education</option>
              {EDUCATION.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <select
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="">Select state</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Languages Known</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLang(lang)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    form.languages.includes(lang)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile & Find Jobs'}
          </button>
        </form>
      </div>
    </div>
  )
}
