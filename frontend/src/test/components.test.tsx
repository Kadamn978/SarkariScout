import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ScrollReveal from '../components/ScrollReveal'
import TiltCard from '../components/TiltCard'
import AnimatedCounter from '../components/AnimatedCounter'
import { ToastProvider } from '../contexts/ToastContext'
import { ThemeProvider } from '../contexts/ThemeContext'

// Mock axios
vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
}))

// Mock AuthContext
vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <div>{children}</div>,
  useAuth: () => ({ user: null, loading: false, login: vi.fn(), logout: vi.fn(), register: vi.fn() }),
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

describe('Navbar', () => {
  it('renders brand name', () => {
    render(<Navbar />, { wrapper: Wrapper })
    expect(screen.getByText(/Rozgar/)).toBeInTheDocument()
  })

  it('renders nav links', () => {
    render(<Navbar />, { wrapper: Wrapper })
    expect(screen.getByText('Jobs')).toBeInTheDocument()
  })

  it('has mobile menu button with aria-label', () => {
    render(<Navbar />, { wrapper: Wrapper })
    const menuBtn = screen.getByLabelText('Toggle menu')
    expect(menuBtn).toBeInTheDocument()
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles mobile menu on click', () => {
    render(<Navbar />, { wrapper: Wrapper })
    const menuBtn = screen.getByLabelText('Toggle menu')
    fireEvent.click(menuBtn)
    expect(menuBtn).toHaveAttribute('aria-expanded', 'true')
  })

  it('has dark mode toggle', () => {
    render(<Navbar />, { wrapper: Wrapper })
    expect(screen.getAllByLabelText(/toggle dark mode/i).length).toBeGreaterThanOrEqual(1)
  })
})

describe('Footer', () => {
  it('renders copyright', () => {
    render(<Footer />, { wrapper: Wrapper })
    expect(screen.getAllByText(/RozgarScout/).length).toBeGreaterThan(0)
  })

  it('renders job links', () => {
    render(<Footer />, { wrapper: Wrapper })
    expect(screen.getByText('All Jobs')).toBeInTheDocument()
  })

  it('renders account links', () => {
    render(<Footer />, { wrapper: Wrapper })
    expect(screen.getAllByRole('link').length).toBeGreaterThan(5)
  })

  it('renders legal links', () => {
    render(<Footer />, { wrapper: Wrapper })
    expect(screen.getByText('Privacy')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })
})

describe('ScrollReveal', () => {
  it('renders children', () => {
    render(
      <ScrollReveal>
        <div>Test Content</div>
      </ScrollReveal>,
      { wrapper: Wrapper }
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ScrollReveal className="custom-class">
        <div>Content</div>
      </ScrollReveal>,
      { wrapper: Wrapper }
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('TiltCard', () => {
  it('renders children', () => {
    render(
      <TiltCard>
        <div>Card Content</div>
      </TiltCard>,
      { wrapper: Wrapper }
    )
    expect(screen.getByText('Card Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <TiltCard className="my-card">
        <div>Content</div>
      </TiltCard>,
      { wrapper: Wrapper }
    )
    expect(container.firstChild).toHaveClass('my-card')
  })
})

describe('AnimatedCounter', () => {
  it('renders with suffix', () => {
    render(<AnimatedCounter target={100} suffix="%" />, { wrapper: Wrapper })
    expect(screen.getByText(/%/)).toBeInTheDocument()
  })

  it('accepts target and suffix props', () => {
    const { container } = render(<AnimatedCounter target={50} suffix="+" duration={100} />, { wrapper: Wrapper })
    expect(container.querySelector('span')).toBeInTheDocument()
  })
})
