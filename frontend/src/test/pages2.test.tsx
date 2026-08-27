import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MockTests from '../pages/MockTests'
import Papers from '../pages/Papers'
import Dashboard from '../pages/Dashboard'
import Leaderboard from '../pages/Leaderboard'
import Progress from '../pages/Progress'
import Profile from '../pages/Profile'
import ExamCalendar from '../pages/ExamCalendar'
import { ToastProvider } from '../contexts/ToastContext'
import { ThemeProvider } from '../contexts/ThemeContext'

const mockGet = vi.fn().mockImplementation((url: string) => {
  if (url.startsWith('/mock-tests')) {
    if (url.includes('leaderboard') || url.includes('history')) return Promise.resolve({ data: [] })
    return Promise.resolve({ data: { tests: [], pagination: { totalPages: 0 } } })
  }
  if (url.startsWith('/papers')) {
    if (url.includes('families')) return Promise.resolve({ data: [] })
    return Promise.resolve({ data: { papers: [], pagination: { totalPages: 0 } } })
  }
  if (url.startsWith('/jobs/user/tracked') || url.startsWith('/jobs/user/stats') || url.startsWith('/jobs/upcoming')) {
    return Promise.resolve({ data: [] })
  }
  if (url === '/users/me') return Promise.resolve({ data: {} })
  if (url.includes('limit=100')) return Promise.resolve({ data: { jobs: [] } })
  return Promise.resolve({ data: [] })
})

vi.mock('../lib/api', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))

vi.mock('../components/AdBanner', () => ({
  default: () => <div data-testid="ad-banner" />,
}))

vi.mock('../components/ScrollReveal', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('../components/TiltCard', () => ({
  default: ({ children, className }: any) => <div className={className}>{children}</div>,
}))

vi.mock('../components/AnimatedCounter', () => ({
  default: ({ target, suffix }: any) => <span>{target}{suffix}</span>,
}))

vi.mock('../components/Navbar', () => ({
  default: () => <nav>Navbar</nav>,
}))

const authUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'USER' }

vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <div>{children}</div>,
  useAuth: () => ({
    user: authUser, loading: false, login: vi.fn(), logout: vi.fn(), register: vi.fn(),
  }),
}))

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  </BrowserRouter>
)

describe('MockTests Page', () => {
  it('renders heading', () => {
    render(<MockTests />, { wrapper: Wrapper })
    expect(screen.getByText('Mock Tests')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<MockTests />, { wrapper: Wrapper })
    expect(screen.getByText(/Practice with real exam patterns/)).toBeInTheDocument()
  })

  it('renders filter buttons', () => {
    render(<MockTests />, { wrapper: Wrapper })
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('SSC')).toBeInTheDocument()
    expect(screen.getByText('UPSC')).toBeInTheDocument()
  })
})

describe('Papers Page', () => {
  it('renders heading', () => {
    render(<Papers />, { wrapper: Wrapper })
    expect(screen.getByText('Previous Year Papers')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<Papers />, { wrapper: Wrapper })
    expect(screen.getByText(/Download previous year question papers/)).toBeInTheDocument()
  })

  it('renders All Years button', () => {
    render(<Papers />, { wrapper: Wrapper })
    expect(screen.getByText('All Years')).toBeInTheDocument()
  })
})

describe('Dashboard Page', () => {
  it('renders heading', () => {
    render(<Dashboard />, { wrapper: Wrapper })
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders welcome message with user name', () => {
    render(<Dashboard />, { wrapper: Wrapper })
    expect(screen.getByText(/Welcome back, Test User/)).toBeInTheDocument()
  })

  it('renders quick action links', () => {
    render(<Dashboard />, { wrapper: Wrapper })
    expect(screen.getByText('Browse Jobs')).toBeInTheDocument()
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    expect(screen.getByText('Email Settings')).toBeInTheDocument()
    expect(screen.getByText('My Documents')).toBeInTheDocument()
  })

  it('renders Your Tracked Jobs section', () => {
    render(<Dashboard />, { wrapper: Wrapper })
    expect(screen.getByText('Your Tracked Jobs')).toBeInTheDocument()
  })

  it('renders Expiring Deadlines section', () => {
    render(<Dashboard />, { wrapper: Wrapper })
    expect(screen.getByText('Expiring Deadlines')).toBeInTheDocument()
  })
})

describe('Leaderboard Page', () => {
  it('renders heading', () => {
    render(<Leaderboard />, { wrapper: Wrapper })
    expect(screen.getByText('Leaderboard')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<Leaderboard />, { wrapper: Wrapper })
    expect(screen.getByText(/See how you rank against other aspirants/)).toBeInTheDocument()
  })

  it('renders tab buttons', () => {
    render(<Leaderboard />, { wrapper: Wrapper })
    expect(screen.getByText('Top Scorers')).toBeInTheDocument()
    expect(screen.getByText('My History')).toBeInTheDocument()
  })
})

describe('Progress Page', () => {
  it('renders heading', () => {
    render(<Progress />, { wrapper: Wrapper })
    expect(screen.getByText('Your Progress')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<Progress />, { wrapper: Wrapper })
    expect(screen.getByText(/Track your government job preparation journey/)).toBeInTheDocument()
  })

  it('renders quick action links', async () => {
    render(<Progress />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText('Take a Test')).toBeInTheDocument()
    })
    expect(screen.getByText('Practice Papers')).toBeInTheDocument()
    expect(screen.getByText('Browse Jobs')).toBeInTheDocument()
  })
})

describe('Profile Page', () => {
  it('renders heading', async () => {
    render(<Profile />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText('Your Profile')).toBeInTheDocument()
    })
  })

  it('renders description', async () => {
    render(<Profile />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText(/Update your details to get personalized job alerts/)).toBeInTheDocument()
    })
  })

  it('renders education field', async () => {
    render(<Profile />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByLabelText('Education *')).toBeInTheDocument()
    })
  })

  it('renders state field', async () => {
    render(<Profile />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByLabelText('State *')).toBeInTheDocument()
    })
  })

  it('renders save button', async () => {
    render(<Profile />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText('Save Profile')).toBeInTheDocument()
    })
  })

  it('renders notification preferences', async () => {
    render(<Profile />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText('Instant Alerts')).toBeInTheDocument()
    })
    expect(screen.getByText('Daily Digest')).toBeInTheDocument()
  })
})

describe('ExamCalendar Page', () => {
  it('renders heading', () => {
    render(<ExamCalendar />, { wrapper: Wrapper })
    expect(screen.getByText('Exam Calendar')).toBeInTheDocument()
  })

  it('renders description', async () => {
    render(<ExamCalendar />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText(/All important dates for government exams/)).toBeInTheDocument()
    })
  })
})
