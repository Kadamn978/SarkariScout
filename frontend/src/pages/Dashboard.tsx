import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/jobs" className="text-xl font-bold text-blue-600">SarkariRadar</Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.name || user?.email}</span>
            <Link to="/profile" className="text-sm text-gray-600 hover:text-blue-600">Profile</Link>
            <button onClick={() => { logout(); navigate('/login') }} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow"><h2 className="text-lg font-semibold mb-2">Jobs Matched</h2><p className="text-3xl font-bold text-blue-600">0</p></div>
          <div className="bg-white p-6 rounded-lg shadow"><h2 className="text-lg font-semibold mb-2">Applications</h2><p className="text-3xl font-bold text-green-600">0</p></div>
          <div className="bg-white p-6 rounded-lg shadow"><h2 className="text-lg font-semibold mb-2">Alerts Sent</h2><p className="text-3xl font-bold text-orange-600">0</p></div>
        </div>
        <Link to="/jobs" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Browse Jobs</Link>
      </div>
    </div>
  )
}
