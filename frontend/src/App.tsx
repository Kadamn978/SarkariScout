import React, { Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import CustomCursor from './components/CustomCursor'
import ProgressBar from './components/ProgressBar'
import SmoothScroll from './components/SmoothScroll'
import LoadingScreen from './components/LoadingScreen'
import SkipToContent from './components/SkipToContent'

import ContentProtection from './components/ContentProtection'
import AdblockDetector from './components/AdblockDetector'
import CookieConsent from './components/CookieConsent'
import Footer from './components/Footer'

// Eagerly loaded core pages (most common entry points)
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

// Lazy-loaded page groups
const Landing = React.lazy(() => import('./pages/Landing'))
const Jobs = React.lazy(() => import('./pages/Jobs'))

import { usePageView } from './hooks/usePageView'
const JobDetail = React.lazy(() => import('./pages/JobDetail'))
const StateJobs = React.lazy(() => import('./pages/StateJobs'))
const QualJobs = React.lazy(() => import('./pages/QualJobs'))

const MockTests = React.lazy(() => import('./pages/MockTests'))
const MockTestPlay = React.lazy(() => import('./pages/MockTestPlay'))

const Papers = React.lazy(() => import('./pages/Papers'))

const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Profile = React.lazy(() => import('./pages/Profile'))
const Documents = React.lazy(() => import('./pages/Documents'))
const Progress = React.lazy(() => import('./pages/Progress'))
const EmailPreferences = React.lazy(() => import('./pages/EmailPreferences'))

const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'))

const Privacy = React.lazy(() => import('./pages/Privacy'))
const Terms = React.lazy(() => import('./pages/Terms'))
const About = React.lazy(() => import('./pages/About'))
const FAQ = React.lazy(() => import('./pages/FAQ'))
const Contact = React.lazy(() => import('./pages/Contact'))

const GoogleAuth = React.lazy(() => import('./pages/GoogleAuth'))
const VerifyEmail = React.lazy(() => import('./pages/VerifyEmail'))
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'))

const BugReport = React.lazy(() => import('./pages/BugReport'))
const ExamCalendar = React.lazy(() => import('./pages/ExamCalendar'))
const Results = React.lazy(() => import('./pages/Results'))
const AdmitCards = React.lazy(() => import('./pages/AdmitCards'))

const Loading = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
  </div>
)

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function PageViewTracker() {
  usePageView()
  return null
}

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ErrorBoundary>
      <ThemeProvider>
      <ToastProvider>
      <BrowserRouter>
        <SkipToContent />
        <AuthProvider>
          <SmoothScroll>
            {loading && <LoadingScreen />}
            <PageViewTracker />
            <CustomCursor />
            <ProgressBar />
            <ContentProtection />
            <AdblockDetector />
            <Routes>
            <Route path="/" element={<Suspense fallback={<Loading />}><Landing /></Suspense>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<Suspense fallback={<Loading />}><AppLayout><Jobs /></AppLayout></Suspense>} />
            <Route path="/jobs/:id" element={<Suspense fallback={<Loading />}><AppLayout><JobDetail /></AppLayout></Suspense>} />
            <Route path="/state/:state" element={<Suspense fallback={<Loading />}><AppLayout><StateJobs /></AppLayout></Suspense>} />
            <Route path="/qualifications/:qual" element={<Suspense fallback={<Loading />}><AppLayout><QualJobs /></AppLayout></Suspense>} />
            <Route path="/mock-tests" element={<Suspense fallback={<Loading />}><AppLayout><MockTests /></AppLayout></Suspense>} />
            <Route path="/mock-tests/:id" element={<ProtectedRoute><Suspense fallback={<Loading />}><AppLayout><MockTestPlay /></AppLayout></Suspense></ProtectedRoute>} />
            <Route path="/papers" element={<Suspense fallback={<Loading />}><AppLayout><Papers /></AppLayout></Suspense>} />
            <Route path="/exam-calendar" element={<Suspense fallback={<Loading />}><AppLayout><ExamCalendar /></AppLayout></Suspense>} />
            <Route path="/results" element={<Suspense fallback={<Loading />}><AppLayout><Results /></AppLayout></Suspense>} />
            <Route path="/admit-cards" element={<Suspense fallback={<Loading />}><AppLayout><AdmitCards /></AppLayout></Suspense>} />
            <Route path="/documents" element={<ProtectedRoute><Suspense fallback={<Loading />}><AppLayout><Documents /></AppLayout></Suspense></ProtectedRoute>} />
            <Route path="/email-preferences" element={<ProtectedRoute><Suspense fallback={<Loading />}><AppLayout><EmailPreferences /></AppLayout></Suspense></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Suspense fallback={<Loading />}><AppLayout><AdminDashboard /></AppLayout></Suspense></AdminRoute>} />
            <Route path="/privacy" element={<Suspense fallback={<Loading />}><AppLayout><Privacy /></AppLayout></Suspense>} />
            <Route path="/terms" element={<Suspense fallback={<Loading />}><AppLayout><Terms /></AppLayout></Suspense>} />
            <Route path="/faq" element={<Suspense fallback={<Loading />}><AppLayout><FAQ /></AppLayout></Suspense>} />
            <Route path="/about" element={<Suspense fallback={<Loading />}><AppLayout><About /></AppLayout></Suspense>} />
            <Route path="/contact" element={<Suspense fallback={<Loading />}><AppLayout><Contact /></AppLayout></Suspense>} />
            <Route path="/leaderboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/progress" element={<ProtectedRoute><Suspense fallback={<Loading />}><AppLayout><Progress /></AppLayout></Suspense></ProtectedRoute>} />
            <Route path="/bug-report" element={<Suspense fallback={<Loading />}><AppLayout><BugReport /></AppLayout></Suspense>} />
            <Route path="/auth/google" element={<Suspense fallback={<Loading />}><GoogleAuth /></Suspense>} />
            <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<Loading />}><AppLayout><Profile /></AppLayout></Suspense></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<Loading />}><AppLayout><Dashboard /></AppLayout></Suspense></ProtectedRoute>} />
            <Route path="/verify-email" element={<Suspense fallback={<Loading />}><VerifyEmail /></Suspense>} />
            <Route path="/forgot-password" element={<Suspense fallback={<Loading />}><ForgotPassword /></Suspense>} />
            <Route path="/reset-password" element={<Suspense fallback={<Loading />}><ResetPassword /></Suspense>} />
            <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
            </Routes>
          </SmoothScroll>
        </AuthProvider>
      </BrowserRouter>
      </ToastProvider>
      </ThemeProvider>
      <CookieConsent />
    </ErrorBoundary>
  )
}
