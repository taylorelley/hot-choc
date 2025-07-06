"use client"

import { useState, useEffect } from "react"
import { MapPin, Calendar, Star, Search, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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

export default function HomePage() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    // Simulate loading for better UX
    setTimeout(() => {
      const savedRatings = localStorage.getItem("hotChocRatings")
      if (savedRatings) {
        setRatings(JSON.parse(savedRatings))
      }
      setIsLoading(false)
    }, 800)
  }, [])

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }

  const getAverageRating = (ratingObj: Rating["ratings"]) => {
    const values = Object.values(ratingObj)
    return (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)
  }

  const filteredRatings = ratings.filter(
    (rating) =>
      rating.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rating.notes.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const SkeletonCard = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 flex gap-4 animate-pulse">
      <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full w-16"></div>
        <div className="h-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full w-32"></div>
        <div className="h-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full w-24"></div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-rose-200/20 to-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-md mx-auto px-4 py-6">
        {/* Header with Search */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
          <div className="flex-1 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="HotChoc.Monster logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-2">
                HotChoc.Monster
              </h1>
              <p className="text-amber-700/80">Discover & rate amazing hot chocolates</p>
            </div>
          </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Search className="w-5 h-5 text-amber-700" />
            </button>
          </div>

          {/* Search Bar */}
          <div
            className={`transition-all duration-500 ease-out ${showSearch ? "max-h-20 opacity-100 mb-4" : "max-h-0 opacity-0"} overflow-hidden`}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-600" />
              <input
                type="text"
                placeholder="Search by location or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-amber-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {!isLoading && ratings.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg">
              <div className="text-2xl font-bold text-amber-800">{ratings.length}</div>
              <div className="text-sm text-amber-600">Total Ratings</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg">
              <div className="text-2xl font-bold text-amber-800">
                {ratings.length > 0
                  ? (
                      ratings.reduce((sum, r) => sum + Number.parseFloat(getAverageRating(r.ratings)), 0) /
                      ratings.length
                    ).toFixed(1)
                  : "0.0"}
              </div>
              <div className="text-sm text-amber-600">Avg Rating</div>
            </div>
          </div>
        )}

        {/* Ratings List */}
        <div className="space-y-4 pb-4">
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredRatings.length === 0 ? (
            // Empty State
            <div className="text-center py-16">
              <div className="relative mb-6">
                <div className="text-8xl opacity-20">☕</div>
                <Sparkles className="absolute top-2 right-8 w-6 h-6 text-amber-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                {searchQuery ? "No matches found" : "No ratings yet"}
              </h3>
              <p className="text-amber-700 mb-8 max-w-xs mx-auto">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Start your hot chocolate journey by rating your first cup!"}
              </p>
              {!searchQuery && (
                <Link href="/new">
                  <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Rate Your First Hot Chocolate
                  </button>
                </Link>
              )}
            </div>
          ) : (
            // Ratings Cards
            filteredRatings.map((rating, index) => (
              <Link key={rating.id} href={`/view/${rating.id}`}>
                <div
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl p-4 flex gap-4 transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 border border-white/20"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: isLoading ? "none" : "slideInUp 0.6s ease-out forwards",
                  }}
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={rating.photo || "/placeholder.svg"}
                      alt="Hot chocolate"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        <span className="font-bold text-amber-900 text-lg">{getAverageRating(rating.ratings)}</span>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              i < Math.round(Number.parseFloat(getAverageRating(rating.ratings)))
                                ? "bg-amber-400"
                                : "bg-amber-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      <span className="truncate font-medium">{rating.location.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(rating.timestamp)}</span>
                    </div>
                    {rating.notes && (
                      <p className="text-sm text-gray-600 truncate bg-amber-50/50 px-2 py-1 rounded-lg">
                        {rating.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
