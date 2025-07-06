import { render, screen } from '@testing-library/react'
import Navbar from '../components/navbar'
import '@testing-library/jest-dom'

jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>
})

jest.mock('next/image', () => (props) => {
  return <img {...props} />
})

jest.mock('lucide-react', () => {
  const React = require('react')
  return new Proxy({}, { get: () => (props) => <svg {...props} /> })
})

const push = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: () => ({ push }),
}))

const { usePathname } = require('next/navigation')

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear()
    push.mockReset()
  })

  test('hides on auth routes', () => {
    usePathname.mockReturnValue('/auth/login')
    const { container } = render(<Navbar />)
    expect(container.firstChild).toBeNull()
  })

  test('shows login options when logged out', () => {
    usePathname.mockReturnValue('/')
    render(<Navbar />)
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  test('shows dashboard link when logged in', () => {
    usePathname.mockReturnValue('/dashboard')
    localStorage.setItem('currentUser', JSON.stringify({ id: '1', name: 'Jane', avatar: '' }))
    render(<Navbar />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
