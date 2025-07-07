"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import Link from "next/link"

interface Rating {
  id: string
  location: { lat: number; lng: number; name: string }
  ratings: { [key: string]: number }
}

export default function MapWithClusters() {
  const [ratings, setRatings] = useState<Rating[]>([])

  useEffect(() => {
    let stored: any[] = []
    try {
      const raw = localStorage.getItem("hotChocRatings")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) stored = parsed
      }
    } catch (err) {
      console.error("Failed to load ratings", err)
    }
    setRatings(stored)
  }, [])

  const getAverageRating = (obj: Rating["ratings"]) => {
    const vals = Object.values(obj)
    return (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1)
  }

  const center: [number, number] = ratings.length
    ? [ratings[0].location.lat, ratings[0].location.lng]
    : [51.505, -0.09]

  return (
    <div className="h-96 w-full">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MarkerClusterGroup chunkedLoading>
          {ratings.map((r) => (
            <Marker
              key={r.id}
              position={[r.location.lat, r.location.lng]}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">{r.location.name}</p>
                  <p className="mb-2 text-sm">{getAverageRating(r.ratings)} ★</p>
                  <Link href={`/view/${r.id}`} className="text-amber-700 underline">
                    View all ratings
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}
