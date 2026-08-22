import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import { DashboardSkeleton } from '../components/Skeleton'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Jobs Matched</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Applications</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Alerts Sent</p>
            <p className="text-2xl sm:text-3xl font-bold text-orange-600">0</p>
          </div>
        </div>
        <a href="/jobs" className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">Browse Jobs</a>
      </main>
    </div>
  )
}
