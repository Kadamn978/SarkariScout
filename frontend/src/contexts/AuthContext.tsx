import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

interface User {
  id: string
  email: string
  name?: string
  role: string
  emailVerifiedAt: string | null
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  needsVerification: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/users/me')
      .then((res) => {
        const userData = res.data
        setUser(userData)
        // If logged in but not verified, redirect to verify page
        if (userData && !userData.emailVerifiedAt) {
          navigate('/verify-email', { replace: true })
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [navigate])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    const userData = res.data.user
    setUser({ ...userData, emailVerifiedAt: res.data.emailVerifiedAt || null })

    // If not verified, redirect to verify page
    if (!res.data.emailVerifiedAt) {
      navigate('/verify-email', { replace: true })
    }
  }

  const register = async (email: string, password: string, name: string) => {
    const res = await api.post('/auth/register', { email, password, name })
    const userData = res.data.user
    setUser({ ...userData, emailVerifiedAt: res.data.emailVerifiedAt || null })
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Cookie cleared by backend even if response fails
    }
    setUser(null)
  }

  const needsVerification = !!user && !user.emailVerifiedAt

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, needsVerification }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
