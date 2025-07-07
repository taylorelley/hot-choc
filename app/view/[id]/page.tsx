'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, Calendar, Star, Share2, Heart, Trash2 } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import Link from 'next/link'
import Image from 'next/image'
import { fetchRating, deleteRating } from '../../lib/api'

interface Rating {
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
}

export default function RatingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [rating, setRating] = useState<Rating | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchRating(params.id as string)
      .then((r) => setRating(r))
      .catch((err) => {
        console.error('Failed to load rating', err)
        setRating(null)
      })
      .finally(() => setIsLoading(false))
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full"></div>
              <div className="h-8 bg-gradient-to-r from-amber-200 to-orange-200 rounded-lg flex-1"></div>
            </div>
            <div className="aspect-square bg-gradient-to-br from-amber-200 to-orange-200 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl"></div>
              <div className="h-32 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!rating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 opacity-30">☕</div>
          <h2 className="text-2xl font-bold text-amber-900 mb-2">
            Rating not found
          </h2>
          <p className="text-amber-700 mb-6">
            This rating might have been deleted or moved.
          </p>
          <Link
            href="/"
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getAverageRating = (ratingObj: Rating['ratings']) => {
    const values = Object.values(ratingObj)
    return (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(
      1,
    )
  }

  const ratingLabels = {
    temperature: {
      label: 'Temperature',
      icon: '🌡️',
      color: 'from-blue-400 to-red-400',
    },
    sweetness: {
      label: 'Sweetness',
      icon: '🍯',
      color: 'from-gray-400 to-yellow-400',
    },
    texture: {
      label: 'Texture',
      icon: '🥛',
      color: 'from-blue-300 to-amber-300',
    },
    chocolate: {
      label: 'Chocolate Intensity',
      icon: '🍫',
      color: 'from-amber-400 to-amber-800',
    },
    creaminess: {
      label: 'Creaminess',
      icon: '🥛',
      color: 'from-white to-amber-200',
    },
    presentation: {
      label: 'Presentation',
      icon: '✨',
      color: 'from-gray-300 to-purple-400',
    },
  }

  const handleDelete = async () => {
    if (!rating) return
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      await deleteRating(token, rating.id)
      const raw = localStorage.getItem('hotChocRatings')
      if (raw) {
        const list = JSON.parse(raw)
        if (Array.isArray(list)) {
          const updated = list.filter((r: any) => r.id !== rating.id)
          localStorage.setItem('hotChocRatings', JSON.stringify(updated))
        }
      }
    } catch (err) {
      console.error('Failed to delete rating', err)
    }
    setShowDeleteConfirm(false)
    router.push('/dashboard')
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-rose-200/20 to-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-md mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                Rating Details
              </h1>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Heart
                  className={`w-5 h-5 transition-colors duration-300 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                />
              </button>
              <button className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Share2 className="w-5 h-5 text-amber-700" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Photo with Overlay Info */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
              <Image
                src={rating.photo || '/placeholder.svg'}
                alt="Hot chocolate"
                width={400}
                height={400}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
                      <Star className="w-5 h-5 text-amber-500 fill-current" />
                      <span className="text-2xl font-bold text-amber-900">
                        {getAverageRating(rating.ratings)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold text-lg">
                      {rating.location.name}
                    </p>
                    <p className="text-white/80 text-sm">
                      {formatDate(rating.timestamp).split(',')[0]}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-amber-800">
                  {getAverageRating(rating.ratings)}
                </div>
                <div className="text-sm text-amber-600">Overall</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-amber-800">
                  {Math.max(...Object.values(rating.ratings))}
                </div>
                <div className="text-sm text-amber-600">Highest</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-amber-800">
                  {Object.values(rating.ratings).filter((r) => r >= 4).length}
                </div>
                <div className="text-sm text-amber-600">4+ Stars</div>
              </div>
            </div>

            {/* Location & Date Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-1">
                      Location
                    </h3>
                    <p className="text-gray-700">{rating.location.name}</p>
                    {rating.location.lat !== 0 && rating.location.lng !== 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {rating.location.lat.toFixed(4)},{' '}
                        {rating.location.lng.toFixed(4)}
                      </p>
                    )}
                    {rating.location.lat !== 0 && rating.location.lng !== 0 && (
                      <div className="h-48 mt-4 rounded-xl overflow-hidden">
                        <MapContainer
                          center={[rating.location.lat, rating.location.lng]}
                          zoom={16}
                          style={{ height: '100%', width: '100%' }}
                          scrollWheelZoom={false}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker
                            position={[
                              rating.location.lat,
                              rating.location.lng,
                            ]}
                          >
                            <Popup>{rating.location.name}</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-1">
                      Date & Time
                    </h3>
                    <p className="text-gray-700">
                      {formatDate(rating.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Ratings with Animations */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500" />
                Detailed Ratings
              </h2>
              <div className="space-y-6">
                {Object.entries(rating.ratings).map(([key, value], index) => (
                  <div key={key} className="group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {ratingLabels[key as keyof typeof ratingLabels].icon}
                        </span>
                        <span className="font-semibold text-amber-900">
                          {ratingLabels[key as keyof typeof ratingLabels].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-amber-600">
                          {value}
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 transition-all duration-300 ${
                                i < value
                                  ? 'text-amber-400 fill-current scale-110'
                                  : 'text-amber-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="relative h-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${ratingLabels[key as keyof typeof ratingLabels].color} rounded-full transition-all duration-1000 ease-out`}
                        style={{
                          width: `${(value / 5) * 100}%`,
                          animationDelay: `${index * 200}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {rating.notes && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  📝 Tasting Notes
                </h2>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border-l-4 border-amber-400">
                  <p className="text-gray-700 leading-relaxed italic">
                    "{rating.notes}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center space-y-4">
            <p className="text-amber-900 font-semibold">Delete this rating?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
