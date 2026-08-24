import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PasswordInput from '../components/PasswordInput'

function validateEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const errs: typeof fieldErrors = {}
    if (!email) errs.email = 'Email is required'
    else if (!validateEmail(email)) errs.email = 'Invalid email'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Min 8 characters'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    window.location.href = `${backendUrl}/auth/google`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <main className="w-full max-w-md p-6 sm:p-8 bg-white rounded-lg shadow" role="main">
        <h1 className="text-2xl font-bold text-center mb-6">Login to SarkariScout</h1>
        {error && <div role="alert" className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign in with Google
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-sm"><span className="bg-white px-3 text-gray-500">or continue with email</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })) }}
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {fieldErrors.email && <p id="login-email-error" className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <PasswordInput
              id="login-password"
              value={password}
              onChange={(v) => { setPassword(v); setFieldErrors((p) => ({ ...p, password: undefined })) }}
              required
              autoComplete="current-password"
            />
            {fieldErrors.password && <p id="login-password-error" className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
            <div className="mt-1 text-right">
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-600">
          Don&apos;t have an account? <Link to="/register" className="text-blue-600 hover:underline font-medium">Register</Link>
        </p>
      </main>
    </div>
  )
}
