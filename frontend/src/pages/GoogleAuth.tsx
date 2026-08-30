import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function GoogleAuth() {
  const navigate = useNavigate()

  useEffect(() => {
    // HttpOnly cookies already set by backend callback — just go to dashboard
    navigate('/dashboard', { replace: true })
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  )
}
