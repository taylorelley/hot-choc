'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import { Star } from 'lucide-react'

export interface LocationGroup {
  location: { lat: number; lng: number; name: string }
  ratings: any[]
  average: number
  firstId: string
}

export default function ExploreMap({ groups }: { groups: LocationGroup[] }) {
  return (
    <div className="h-96 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg">
      <MapContainer
        center={
          groups.length > 0
            ? [groups[0].location.lat, groups[0].location.lng]
            : [0, 0]
        }
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MarkerClusterGroup chunkedLoading>
          {groups.map((group, idx) => (
            <Marker
              key={idx}
              position={[group.location.lat, group.location.lng]}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold text-amber-900">
                    {group.location.name}
                  </div>
                  <div className="flex items-center gap-1 text-amber-700">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="font-medium">
                      {group.average.toFixed(1)}
                    </span>
                  </div>
                  <a
                    href={`/view/${group.firstId}`}
                    className="text-amber-600 underline text-sm"
                  >
                    View Ratings
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}
