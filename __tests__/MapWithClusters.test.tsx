import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('react-leaflet-cluster', () =>
  ({ children }: any) => <div data-testid="cluster">{children}</div>,
)

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

import MapWithClusters from '../components/MapWithClusters'

describe('MapWithClusters', () => {
  test('renders markers from localStorage', () => {
    const rating = {
      id: '1',
      location: { lat: 1, lng: 2, name: 'Cafe' },
      ratings: { a: 4, b: 2, c: 3, d: 5, e: 4, f: 2 },
    }
    localStorage.setItem('hotChocRatings', JSON.stringify([rating]))
    render(<MapWithClusters />)
    expect(screen.getByTestId('map')).toBeInTheDocument()
    expect(screen.getAllByTestId('marker').length).toBe(1)
  })
})
