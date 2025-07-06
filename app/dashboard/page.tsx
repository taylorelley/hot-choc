"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Star, MapPin, TrendingUp, Award, Users, Coffee, Plus, Search } from "lucide-react"

interface Rating {
  id: string
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
  userId?: string
}

interface DashboardUser {
  id: string
  name: string
  email: string
  avatar: string
  joinDate: string
  stats: {
    totalRatings: number
    averageRating: number
    favoriteLocation: string
    totalLocations: number
  }
  following: string[]
  followers: string[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    const userData = JSON.parse(currentUser)
    setUser(userData)

    // Load user's ratings
    const allRatings = JSON.parse(localStorage.getItem("hotChocRatings") || "[]")
    const userRatings = allRatings.filter((r: Rating) => r.userId === userData.id)
    setRatings(userRatings)

    // Update user stats
    if (userRatings.length > 0) {
      const avgRating =
        userRatings.reduce((sum: number, r: Rating) => {
          const ratingValues = Object.values(r.ratings)
          const ratingAvg = ratingValues.reduce((s, v) => s + v, 0) / ratingValues.length
          return sum + ratingAvg
        }, 0) / userRatings.length

      const locations = [...new Set(userRatings.map((r: Rating) => r.location.name))]
      const locationCounts = locations.map((loc) => ({
        location: loc,
        count: userRatings.filter((r: Rating) => r.location.name === loc).length,
      }))
      const favoriteLocation = locationCounts.sort((a, b) => b.count - a.count)[0]?.location || ""

      const updatedUser = {
        ...userData,
        stats: {
          totalRatings: userRatings.length,
          averageRating: Number(avgRating.toFixed(1)),
          favoriteLocation,
          totalLocations: locations.length,
        },
      }

      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }

    // Mock recent activity
    setRecentActivity([
      { type: "rating", message: "You rated a hot chocolate at Starbucks", time: "2 hours ago" },
      { type: "achievement", message: "You earned the 'Coffee Connoisseur' badge", time: "1 day ago" },
      { type: "follow", message: "Sarah started following you", time: "2 days ago" },
    ])

    // Mock achievements
    setAchievements([
      { id: 1, name: "First Rating", description: "Rate your first hot chocolate", earned: true, icon: "⭐" },
      { id: 2, name: "Explorer", description: "Rate at 5 different locations", earned: false, icon: "🗺️" },
      { id: 3, name: "Critic", description: "Write 10 detailed reviews", earned: false, icon: "📝" },
      { id: 4, name: "Social Butterfly", description: "Get 10 followers", earned: false, icon: "🦋" },
    ])
  }, [router])

  const getAverageRating = (ratingObj: Rating["ratings"]) => {
    const values = Object.values(ratingObj)
    return (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-rose-200/20 to-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-md mx-auto px-4 pt-20 pb-6">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-2">
            Your Dashboard
          </h1>
          <p className="text-amber-600">Track your hot chocolate journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-800">{user.stats.totalRatings}</div>
                <div className="text-sm text-amber-600">Total Ratings</div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-800">{user.stats.averageRating || "0.0"}</div>
                <div className="text-sm text-amber-600">Avg Rating</div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-800">{user.stats.totalLocations}</div>
                <div className="text-sm text-amber-600">Locations</div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-800">{user.followers?.length || 0}</div>
                <div className="text-sm text-amber-600">Followers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/new">
            <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <Plus className="w-5 h-5" />
              New Rating
            </button>
          </Link>
          <Link href="/explore">
            <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <Search className="w-5 h-5" />
              Explore
            </button>
          </Link>
        </div>

        {/* Recent Ratings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-amber-900">Recent Ratings</h2>
            <Link href="/" className="text-amber-600 text-sm hover:text-amber-700 transition-colors">
              View All
            </Link>
          </div>

          {ratings.length === 0 ? (
            <div className="text-center py-8">
              <Coffee className="w-12 h-12 text-amber-300 mx-auto mb-3" />
              <p className="text-amber-600">No ratings yet</p>
              <p className="text-amber-500 text-sm">Start by rating your first hot chocolate!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ratings.slice(0, 3).map((rating) => (
                <Link key={rating.id} href={`/view/${rating.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50/50 transition-colors">
                    <Image
                      src={rating.photo || "/placeholder.svg"}
                      alt="Hot chocolate"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-amber-900 text-sm">{rating.location.name}</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                        <span className="text-amber-600 text-sm">{getAverageRating(rating.ratings)}</span>
                        <span className="text-gray-400 text-xs">{new Date(rating.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Achievements
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  achievement.earned
                    ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50"
                    : "border-gray-200 bg-gray-50 opacity-60"
                }`}
              >
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <h3 className="font-semibold text-amber-900 text-sm mb-1">{achievement.name}</h3>
                <p className="text-xs text-amber-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4">Recent Activity</h2>

          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-amber-900 text-sm">{activity.message}</p>
                  <p className="text-amber-500 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
