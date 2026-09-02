import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="max-w-md mx-auto py-12 px-4">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid Reset Link</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">No reset token found. Please request a new one.</p>
            <Link to="/forgot-password" className="text-blue-600 hover:underline">Request new link</Link>
          </div>
        </main>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setStatus('loading')
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setError(err.response?.data?.message || 'Reset failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Enter your new password below.</p>

          {status === 'success' ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">Password reset successful!</p>
              <Link to="/login" className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors">
                Login with new password
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && <div role="alert" className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 rounded-lg">{error}</div>}
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-4"
                placeholder="Min 8 chars, uppercase, lowercase, number, special"
              />
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-4"
                placeholder="Re-enter password"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                {status === 'loading' ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
