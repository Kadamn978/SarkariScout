import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PasswordInput from '../components/PasswordInput'

function validateEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const errs: typeof fieldErrors = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!email) errs.email = 'Email is required'
    else if (!validateEmail(email)) errs.email = 'Invalid email'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Min 8 characters'
    else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) errs.password = 'Need uppercase + number'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setError('')
    setLoading(true)
    try {
      await register(email, password, name.trim())
      navigate('/profile')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <main className="w-full max-w-md p-6 sm:p-8 bg-white rounded-lg shadow" role="main">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
        {error && <div role="alert" className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: undefined })) }}
              autoComplete="name"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? 'reg-name-error' : undefined}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {fieldErrors.name && <p id="reg-name-error" className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })) }}
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {fieldErrors.email && <p id="reg-email-error" className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <PasswordInput
              id="reg-password"
              value={password}
              onChange={(v) => { setPassword(v); setFieldErrors((p) => ({ ...p, password: undefined })) }}
              placeholder="Min 8 chars, uppercase + number"
              required
              minLength={8}
              autoComplete="new-password"
            />
            {fieldErrors.password && <p id="reg-password-error" className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition-colors"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-medium">Login</Link>
        </p>
      </main>
    </div>
  )
}
