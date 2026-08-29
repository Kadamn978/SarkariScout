import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'

export default function GoogleAuth() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const refresh = searchParams.get('refresh')

    if (token && refresh) {
      localStorage.setItem('access_token', token)
      localStorage.setItem('refresh_token', refresh)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      navigate('/dashboard')
    } else {
      setError('Google sign-in failed. Please try again.')
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-md mx-auto py-16 px-4 text-center">
        {error ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-semibold mb-2">Sign-in Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <a href="/login" className="text-blue-600 hover:underline">Try again</a>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Signing you in...</p>
          </div>
        )}
      </main>
    </div>
  )
}
