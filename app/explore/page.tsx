'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import {
  Search,
  Filter,
  Star,
  MapPin,
  Map,
  Heart,
  CircleUserRound,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'

interface User {
  id: string
  name: string
  avatar: string
  stats: {
    totalRatings: number
    averageRating: number
  }
  isFollowing?: boolean
}

interface CommunityRating {
  id: string
  userId: string
  userName: string
  userAvatar: string
  photo: string
  location: {
    name: string
  }
  ratings: {
    temperature: number
    sweetness: number
    texture: number
    chocolate: number
    creaminess: number
    presentation: number
  }
  notes: string
  timestamp: string
  likes: number
  isLiked?: boolean
}

interface LocalRating {
  id: string
  photo: string
  location: {
    lat: number
    lng: number
    name: string
  }
  ratings: {
    temperature: number
    sweetness: number
    texture: number
    chocolate: number
    creaminess: number
    presentation: number
  }
  notes: string
  timestamp: string
  userId?: string
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState('nearby')
  const [searchQuery, setSearchQuery] = useState('')
  const [communityRatings, setCommunityRatings] = useState<CommunityRating[]>(
    [],
  )
  const [topUsers, setTopUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [localRatings, setLocalRatings] = useState<LocalRating[]>([])

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    if (user) {
      setCurrentUser(JSON.parse(user))
    }

    // In a real app this would fetch community data from the API
    setCommunityRatings([])
    setTopUsers([])

    // Load ratings saved locally
    try {
      const raw = localStorage.getItem('hotChocRatings')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setLocalRatings(
            parsed.filter(
              (r: LocalRating) =>
                r.location && r.location.lat && r.location.lng,
            ),
          )
        }
      }
    } catch (err) {
      console.error('Failed to read local ratings', err)
    }
  }, [])

  const getAverageRating = (ratings: CommunityRating['ratings']) => {
    const values = Object.values(ratings)
    return (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(
      1,
    )
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60),
    )

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const handleLike = (ratingId: string) => {
    setCommunityRatings((prev) =>
      prev.map((rating) =>
        rating.id === ratingId
          ? {
              ...rating,
              isLiked: !rating.isLiked,
              likes: rating.isLiked ? rating.likes - 1 : rating.likes + 1,
            }
          : rating,
      ),
    )
  }

  const handleFollow = (userId: string) => {
    setTopUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user,
      ),
    )
  }

  const ratingAverage = (r: LocalRating['ratings']) => {
    const vals = Object.values(r)
    return vals.reduce((s, v) => s + v, 0) / vals.length
  }

  const locationGroups = useMemo(() => {
    const map = new Map<
      string,
      { location: LocalRating['location']; ratings: LocalRating[] }
    >()
    localRatings.forEach((r) => {
      const key = `${r.location.lat},${r.location.lng}`
      if (!map.has(key)) {
        map.set(key, { location: r.location, ratings: [] })
      }
      map.get(key)!.ratings.push(r)
    })
    return Array.from(map.values()).map((g) => ({
      ...g,
      average:
        g.ratings.reduce((sum, r) => sum + ratingAverage(r.ratings), 0) /
        g.ratings.length,
      firstId: g.ratings[0].id,
    }))
  }, [localRatings])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-rose-200/20 to-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mb-4">
            <Image
              src="/logo.png"
              alt="HotChoc.Monster logo"
              width={1154}
              height={517}
              className="h-24 w-auto mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
            Explore Community
          </h1>
          <p className="text-amber-600">Discover amazing hot chocolates</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-600" />
          <input
            type="text"
            placeholder="Search locations, users, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border border-amber-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all duration-300"
          />
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-amber-600 hover:text-amber-700 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2 mb-6">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab('nearby')}
              className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'nearby'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="font-medium">Nearby</span>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'map'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Map className="w-4 h-4" />
              <span className="font-medium">Map</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'nearby' && (
          <div className="space-y-6">
            {communityRatings.map((rating) => (
              <div
                key={rating.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden"
              >
                {/* User Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={rating.userAvatar || '/placeholder.svg'}
                      alt={rating.userName}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-amber-900">
                        {rating.userName}
                      </h3>
                      <p className="text-sm text-amber-600">
                        {formatTimeAgo(rating.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="font-semibold text-amber-900">
                      {getAverageRating(rating.ratings)}
                    </span>
                  </div>
                </div>

                {/* Photo */}
                <Image
                  src={rating.photo || '/placeholder.svg'}
                  alt="Hot chocolate"
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover"
                />

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-amber-900">
                      {rating.location.name}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4">{rating.notes}</p>

                  {/* Rating Bars */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {Object.entries(rating.ratings).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-amber-600 capitalize w-16">
                          {key}
                        </span>
                        <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                            style={{ width: `${(value / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-amber-700 w-4">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-amber-100">
                    <button
                      onClick={() => handleLike(rating.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                        rating.isLiked
                          ? 'bg-red-50 text-red-600'
                          : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${rating.isLiked ? 'fill-current' : ''}`}
                      />
                      <span className="text-sm font-medium">
                        {rating.likes}
                      </span>
                    </button>
                    <button className="text-amber-600 text-sm font-medium hover:text-amber-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="h-96 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg">
            <MapContainer
              center={
                locationGroups.length > 0
                  ? [
                      locationGroups[0].location.lat,
                      locationGroups[0].location.lng,
                    ]
                  : [0, 0]
              }
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MarkerClusterGroup chunkedLoading>
                {locationGroups.map((group, idx) => (
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
        )}
      </div>
    </div>
  )
}
