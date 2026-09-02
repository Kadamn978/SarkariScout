import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Enter your email and we'll send you a reset link.</p>

          {status === 'success' ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">If that email is registered, you'll receive a reset link shortly.</p>
              <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && <div role="alert" className="p-3 mb-4 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">{error}</div>}
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-4 dark:bg-gray-800 dark:text-white"
                placeholder="you@example.com"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
