import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'

export default function BugReport() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('bug')
  const [priority, setPriority] = useState('medium')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setError('Please fill in all fields')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await api.post('/feedback/bugs', { title, description, category, priority })
      setSuccess(true)
      setTitle('')
      setDescription('')
    } catch {
      setError('Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-2xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold dark:text-white mb-2">Report a Bug</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Found something wrong? Let us know and we'll fix it.</p>

        {success ? (
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold dark:text-white mb-2">Thank you!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Your bug report has been submitted. We'll look into it and fix it.</p>
            <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
            {error && <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800 rounded-lg">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the issue"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What happened? What did you expect? Steps to reproduce?"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm"
                >
                  <option value="bug">Bug</option>
                  <option value="feature">Feature Request</option>
                  <option value="improvement">Improvement</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm"
                >
                  <option value="low">Low - Minor issue</option>
                  <option value="medium">Medium - Affects usage</option>
                  <option value="high">High - Critical / Blocking</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
