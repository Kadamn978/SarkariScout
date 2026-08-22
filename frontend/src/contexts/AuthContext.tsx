import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import api from '../lib/api'

interface User {
  id: string
  email: string
  name?: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/users/me')
        .then((res) => setUser(res.data.user || res.data))
        .catch(() => localStorage.removeItem('access_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('access_token', res.data.accessToken)
    localStorage.setItem('refresh_token', res.data.refreshToken)
    setUser(res.data.user)
  }

  const register = async (email: string, password: string, name: string) => {
    const res = await api.post('/auth/register', { email, password, name })
    localStorage.setItem('access_token', res.data.accessToken)
    localStorage.setItem('refresh_token', res.data.refreshToken)
    setUser(res.data.user)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch { /* ignore */ }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
