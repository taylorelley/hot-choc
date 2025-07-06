import { render, screen } from '@testing-library/react'

jest.mock('class-variance-authority', () => ({
  cva: () => () => 'destructive',
}), { virtual: true })
jest.mock('../lib/utils', () => ({ cn: (...c: string[]) => c.join(' ') }))

import { Badge } from '../components/ui/badge'

describe('Badge', () => {
  test('renders children', () => {
    render(<Badge>Test</Badge>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  test('applies variant classes', () => {
    render(<Badge variant="destructive">Danger</Badge>)
    const badge = screen.getByText('Danger')
    expect(badge.className).toMatch(/destructive/)
  })
})
