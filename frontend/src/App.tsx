import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import StateJobs from './pages/StateJobs'
import QualJobs from './pages/QualJobs'
import Documents from './pages/Documents'
import BugReport from './pages/BugReport'
import GoogleAuth from './pages/GoogleAuth'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import MockTests from './pages/MockTests'
import MockTestPlay from './pages/MockTestPlay'
import Papers from './pages/Papers'
import EmailPreferences from './pages/EmailPreferences'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'
import Privacy from './pages/Privacy'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<AppLayout><Jobs /></AppLayout>} />
            <Route path="/jobs/:id" element={<AppLayout><JobDetail /></AppLayout>} />
            <Route path="/state/:state" element={<AppLayout><StateJobs /></AppLayout>} />
            <Route path="/qualifications/:qual" element={<AppLayout><QualJobs /></AppLayout>} />
            <Route path="/mock-tests" element={<AppLayout><MockTests /></AppLayout>} />
            <Route path="/mock-tests/:id" element={<ProtectedRoute><AppLayout><MockTestPlay /></AppLayout></ProtectedRoute>} />
            <Route path="/papers" element={<AppLayout><Papers /></AppLayout>} />
            <Route path="/documents" element={<ProtectedRoute><AppLayout><Documents /></AppLayout></ProtectedRoute>} />
            <Route path="/email-preferences" element={<ProtectedRoute><AppLayout><EmailPreferences /></AppLayout></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AppLayout><AdminDashboard /></AppLayout></AdminRoute>} />
            <Route path="/privacy" element={<AppLayout><Privacy /></AppLayout>} />
            <Route path="/terms" element={<AppLayout><Privacy /></AppLayout>} />
            <Route path="/bug-report" element={<AppLayout><BugReport /></AppLayout>} />
            <Route path="/auth/google" element={<GoogleAuth />} />
            <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
