import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

interface MockTest {
  id: string; title: string; description: string; examFamily: string;
  totalQuestions: number; totalMarks: number; durationMinutes: number;
  attemptCount: number; createdAt: string;
}

const EXAM_FAMILIES = ['SSC', 'UPSC', 'Banking', 'Railway', 'Engineering', 'Medical', 'Defence', 'State PSC']

export default function MockTests() {
  const [tests, setTests] = useState<MockTest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadTests()
  }, [filter, page])

  async function loadTests() {
    setLoading(true)
    try {
      const params: any = { page, limit: 12 }
      if (filter) params.examFamily = filter
      const res = await api.get('/mock-tests', { params })
      setTests(res.data.tests)
      setTotalPages(res.data.pagination.totalPages)
    } catch (e) {
      console.error('Failed to load tests', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mock Tests</h1>
          <p className="text-gray-600 mt-2">Practice with real exam patterns. Score yourself and track improvement.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setFilter(''); setPage(1) }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${!filter ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
          >
            All
          </button>
          {EXAM_FAMILIES.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1) }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="flex gap-4"><div className="h-3 bg-gray-200 rounded w-20" /><div className="h-3 bg-gray-200 rounded w-20" /></div>
              </div>
            ))}
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <p className="text-gray-500 text-lg">No mock tests available yet.</p>
            <p className="text-gray-400 mt-2">Tests will appear here once created by admins.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <Link
                key={test.id}
                to={`/mock-tests/${test.id}`}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition border border-gray-100 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{test.examFamily}</span>
                  <span className="text-xs text-gray-400">{test.durationMinutes} min</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">{test.title}</h3>
                {test.description && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{test.description}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{test.totalQuestions} Qs</span>
                  <span>{test.totalMarks} marks</span>
                  <span>{test.attemptCount} attempts</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-50">Prev</button>
            <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  )
}
