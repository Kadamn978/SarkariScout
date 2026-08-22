import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import Navbar from '../components/Navbar'

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
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    education: '', state: '', category: 'General', languages: [] as string[], dateOfBirth: '',
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
    if (!form.education || !form.state) { setError('Education and State are required'); return }
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto py-6 sm:py-8 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold mb-1">Complete Your Profile</h1>
          <p className="text-gray-500 text-sm mb-6">Tell us about yourself to get personalized job alerts.</p>
          {error && <div role="alert" className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="edu" className="block text-sm font-medium text-gray-700 mb-1">Education *</label>
              <select id="edu" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="">Select education</option>
                {EDUCATION.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <select id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="">Select state</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input id="dob" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">Languages Known</legend>
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
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </fieldset>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Profile & Find Jobs'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
