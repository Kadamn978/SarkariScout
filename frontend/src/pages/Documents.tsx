import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'

interface Document {
  id: string
  type: string
  name: string
  fileName: string
  fileSize: number
  mimeType: string
  isDefault: boolean
  createdAt: string
}

const DOC_TYPES = [
  { value: 'PHOTO', label: 'Passport Photo', icon: '📷' },
  { value: 'SIGNATURE', label: 'Signature', icon: '✍️' },
  { value: 'MARKSHEET', label: 'Marksheet', icon: '📝' },
  { value: 'CERTIFICATE', label: 'Certificate', icon: '📜' },
  { value: 'ID_PROOF', label: 'ID Proof (Aadhaar/PAN)', icon: '🪪' },
  { value: 'ADDRESS_PROOF', label: 'Address Proof', icon: '🏠' },
  { value: 'CATEGORY_CERT', label: 'Category Certificate (SC/ST/OBC)', icon: '📋' },
  { value: 'EXPERIENCE', label: 'Experience Certificate', icon: '💼' },
  { value: 'OTHER', label: 'Other Document', icon: '📄' },
]

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState('PHOTO')
  const [selectedName, setSelectedName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents')
      setDocuments(res.data)
    } catch {
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, WebP, and PDF files are allowed')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', selectedType)
    formData.append('name', selectedName || file.name)

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('Document uploaded successfully')
      setSelectedName('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchDocuments()
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    try {
      await api.delete(`/documents/${id}`)
      fetchDocuments()
    } catch {
      setError('Delete failed')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await api.post(`/documents/${id}/default`)
      fetchDocuments()
    } catch {
      setError('Failed to set default')
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const grouped = DOC_TYPES.map((t) => ({
    ...t,
    docs: documents.filter((d) => d.type === t.value),
  })).filter((g) => g.docs.length > 0 || g.value === selectedType)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <Link to="/profile" className="inline-flex items-center text-blue-600 hover:underline text-sm mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Profile
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Document Wallet</h1>
        <p className="text-gray-600 mb-6">Store your documents for quick form filling. Free for life.</p>

        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
        {success && <div className="p-3 mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">{success}</div>}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold mb-4">Upload New Document</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {DOC_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
              <input
                type="text"
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                placeholder="e.g., 10th Marksheet"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File (max 5MB)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">No documents uploaded yet</p>
            <p className="text-gray-400 text-sm mt-1">Upload your first document above</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.value} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-medium text-gray-900">{group.icon} {group.label}</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {group.docs.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">No {group.label.toLowerCase()} uploaded</div>
                  ) : (
                    group.docs.map((doc) => (
                      <div key={doc.id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">{formatSize(doc.fileSize)} · {new Date(doc.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {doc.isDefault && (
                            <span className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded-full">Default</span>
                          )}
                          {!doc.isDefault && (
                            <button
                              onClick={() => handleSetDefault(doc.id)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
