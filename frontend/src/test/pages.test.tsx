import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Landing from '../pages/Landing'
import FAQ from '../pages/FAQ'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Jobs from '../pages/Jobs'
import About from '../pages/About'
import NotFound from '../pages/NotFound'
import { ToastProvider } from '../contexts/ToastContext'
import { ThemeProvider } from '../contexts/ThemeContext'

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { jobs: [], total: 0, page: 1, pages: 0 } }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))

vi.mock('../components/AdBanner', () => ({
  default: () => <div data-testid="ad-banner" />,
}))

vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <div>{children}</div>,
  useAuth: () => ({
    user: null, loading: false, login: vi.fn(), logout: vi.fn(), register: vi.fn(),
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

describe('Landing Page', () => {
  it('renders hero heading', () => {
    render(<Landing />, { wrapper: Wrapper })
    expect(screen.getAllByText(/RozgarScout/i).length).toBeGreaterThan(0)
  })

  it('renders category links', () => {
    render(<Landing />, { wrapper: Wrapper })
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(3)
  })

  it('renders category cards', () => {
    render(<Landing />, { wrapper: Wrapper })
    expect(screen.getAllByText(/SSC/i).length).toBeGreaterThan(0)
  })

  it('renders CTA buttons', () => {
    render(<Landing />, { wrapper: Wrapper })
    const buttons = screen.getAllByRole('link')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders feature section', () => {
    render(<Landing />, { wrapper: Wrapper })
    expect(screen.getByText(/Why/i)).toBeInTheDocument()
  })
})

describe('FAQ Page', () => {
  it('renders heading', () => {
    render(<FAQ />, { wrapper: Wrapper })
    expect(screen.getByText(/Frequently Asked/i)).toBeInTheDocument()
  })

  it('renders FAQ items', () => {
    render(<FAQ />, { wrapper: Wrapper })
    expect(screen.getByText(/What is RozgarScout/i)).toBeInTheDocument()
  })

  it('toggles FAQ answer on click', () => {
    render(<FAQ />, { wrapper: Wrapper })
    const question = screen.getByText(/What is RozgarScout/i)
    fireEvent.click(question)
    expect(screen.getByText(/government job aggregator/i)).toBeInTheDocument()
  })

  it('renders contact CTA', () => {
    render(<FAQ />, { wrapper: Wrapper })
    expect(screen.getByText(/Still Have/i)).toBeInTheDocument()
  })
})

describe('Login Page', () => {
  it('renders login heading', () => {
    render(<Login />, { wrapper: Wrapper })
    expect(screen.getByText(/Login to RozgarScout/i)).toBeInTheDocument()
  })

  it('renders email and password fields', () => {
    render(<Login />, { wrapper: Wrapper })
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getAllByText(/password/i).length).toBeGreaterThan(0)
  })

  it('renders submit button', () => {
    render(<Login />, { wrapper: Wrapper })
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders register link', () => {
    render(<Login />, { wrapper: Wrapper })
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })
})

describe('Register Page', () => {
  it('renders register heading', () => {
    render(<Register />, { wrapper: Wrapper })
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument()
  })

  it('renders form fields', () => {
    render(<Register />, { wrapper: Wrapper })
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<Register />, { wrapper: Wrapper })
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})

describe('Jobs Page', () => {
  it('renders heading', () => {
    render(<Jobs />, { wrapper: Wrapper })
    expect(screen.getAllByRole('heading').length).toBeGreaterThan(0)
  })

  it('renders search input', () => {
    render(<Jobs />, { wrapper: Wrapper })
    expect(screen.getByPlaceholderText(/search by title/i)).toBeInTheDocument()
  })
})

describe('About Page', () => {
  it('renders about heading', () => {
    render(<About />, { wrapper: Wrapper })
    expect(screen.getByText(/About RozgarScout/i)).toBeInTheDocument()
  })

  it('renders content sections', () => {
    render(<About />, { wrapper: Wrapper })
    const sections = screen.getAllByRole('heading')
    expect(sections.length).toBeGreaterThan(1)
  })
})

describe('NotFound Page', () => {
  it('renders 404', () => {
    render(<NotFound />, { wrapper: Wrapper })
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders not found message', () => {
    render(<NotFound />, { wrapper: Wrapper })
    expect(screen.getByText(/page.*not found/i)).toBeInTheDocument()
  })

  it('renders go home link', () => {
    render(<NotFound />, { wrapper: Wrapper })
    expect(screen.getByText(/Go Home/i)).toBeInTheDocument()
  })
})
