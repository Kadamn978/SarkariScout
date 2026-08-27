import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useSEO } from '../hooks/useSEO'

interface Paper {
  id: string; title: string; examFamily: string; year: number;
  qualification: string; fileUrl: string; externalUrl: string;
  description: string; downloadCount: number;
}

interface FamilyCount { examFamily: string; count: number }

export default function Papers() {
  useSEO({
    title: 'Previous Year Question Papers',
    description: 'Download previous year question papers for SSC, UPSC, IBPS, RRB, Engineering exams. Organized by exam family and year.',
    canonical: 'https://sarkariscout.in/papers',
    ogTitle: 'Previous Year Papers | SarkariScout',
    ogDescription: 'Free previous year question papers for government exams.',
  })

  const [papers, setPapers] = useState<Paper[]>([])
  const [families, setFamilies] = useState<FamilyCount[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadFamilies()
  }, [])

  useEffect(() => {
    loadPapers()
  }, [filter, yearFilter, page])

  async function loadFamilies() {
    try {
      const res = await api.get('/papers/families')
      setFamilies(res.data)
    } catch (e) {
      console.error('Failed to load families', e)
    }
  }

  async function loadPapers() {
    setLoading(true)
    try {
      const params: any = { page, limit: 15 }
      if (filter) params.examFamily = filter
      if (yearFilter) params.year = yearFilter
      const res = await api.get('/papers', { params })
      setPapers(res.data.papers)
      setTotalPages(res.data.pagination.totalPages)
    } catch (e) {
      console.error('Failed to load papers', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload(paper: Paper) {
    try {
      await api.post(`/papers/${paper.id}/download`)
    } catch {
      // Download tracking failed — continue with download anyway
    }
    if (paper.fileUrl) {
      window.open(paper.fileUrl, '_blank')
    } else if (paper.externalUrl) {
      window.open(paper.externalUrl, '_blank')
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Previous Year Papers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Download previous year question papers for practice.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => { setFilter(''); setPage(1) }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${!filter ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'}`}
          >
            All ({families.reduce((s, f) => s + f.count, 0)})
          </button>
          {families.map((f) => (
            <button
              key={f.examFamily}
              onClick={() => { setFilter(f.examFamily); setPage(1) }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === f.examFamily ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'}`}
            >
              {f.examFamily} ({f.count})
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => { setYearFilter(''); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${!yearFilter ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'}`}
          >
            All Years
          </button>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => { setYearFilter(String(y)); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${yearFilter === String(y) ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'}`}
            >
              {y}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 animate-pulse flex gap-4 dark:bg-gray-900">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex-1"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" /></div>
              </div>
            ))}
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No papers found for this filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {papers.map((paper) => (
              <div key={paper.id} className="bg-white rounded-xl p-5 hover:shadow-md transition border border-gray-100 flex items-center gap-4 dark:bg-gray-900 dark:border-gray-800">
                <div className="shrink-0 w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{paper.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{paper.examFamily}</span>
                    <span>{paper.year}</span>
                    {paper.qualification && <span>{paper.qualification}</span>}
                    <span>{paper.downloadCount > 0 ? `${paper.downloadCount} downloads` : ''}</span>
                  </div>
                  {paper.description && <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 truncate">{paper.description}</p>}
                </div>
                <button
                  onClick={() => handleDownload(paper)}
                  className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">Prev</button>
            <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">Next</button>
          </div>
        )}
      </div>
    </div>
  )
}
