"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Coffee, Star, Users, ArrowRight, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [preferences, setPreferences] = useState({
    favoriteTypes: [] as string[],
    interests: [] as string[],
    notifications: true,
  })

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/auth/login")
    }
  }, [router])

  const handleComplete = () => {
    // Save preferences to user profile
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    const updatedUser = { ...currentUser, preferences: { ...currentUser.preferences, ...preferences } }
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))

    router.push("/dashboard")
  }

  const chocolateTypes = [
    { id: "milk", label: "Milk Chocolate", icon: "🥛" },
    { id: "dark", label: "Dark Chocolate", icon: "🍫" },
    { id: "white", label: "White Chocolate", icon: "🤍" },
    { id: "spiced", label: "Spiced", icon: "🌶️" },
    { id: "mint", label: "Mint", icon: "🌿" },
    { id: "caramel", label: "Caramel", icon: "🍯" },
  ]

  const interests = [
    { id: "cafes", label: "Coffee Shops", icon: "☕" },
    { id: "travel", label: "Travel", icon: "✈️" },
    { id: "photography", label: "Food Photography", icon: "📸" },
    { id: "social", label: "Social Sharing", icon: "👥" },
    { id: "reviews", label: "Writing Reviews", icon: "✍️" },
    { id: "discovery", label: "Discovering New Places", icon: "🗺️" },
  ]

  const toggleSelection = (category: "favoriteTypes" | "interests", id: string) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: prev[category].includes(id) ? prev[category].filter((item) => item !== id) : [...prev[category], id],
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-rose-200/20 to-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-md mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <Image
              src="/logo.png"
              alt="HotChoc.Monster logo"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-2">
            Welcome to HotChoc.Monster!
          </h1>
          <p className="text-amber-700">Let's personalize your experience</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentStep >= step ? "bg-amber-500 scale-110" : "bg-amber-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          {currentStep === 1 && (
            <div className="text-center">
              <Star className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-amber-900 mb-2">What's your favorite?</h2>
              <p className="text-amber-600 mb-6">Select the types of hot chocolate you love most</p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {chocolateTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleSelection("favoriteTypes", type.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      preferences.favoriteTypes.includes(type.id)
                        ? "border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 scale-105"
                        : "border-amber-200 bg-white/50 hover:border-amber-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-sm font-medium text-amber-900">{type.label}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                disabled={preferences.favoriteTypes.length === 0}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 hover:scale-[1.02]"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center">
              <Users className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-amber-900 mb-2">What interests you?</h2>
              <p className="text-amber-600 mb-6">Help us tailor your experience</p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {interests.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleSelection("interests", interest.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      preferences.interests.includes(interest.id)
                        ? "border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 scale-105"
                        : "border-amber-200 bg-white/50 hover:border-amber-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">{interest.icon}</div>
                    <div className="text-sm font-medium text-amber-900">{interest.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-amber-900 mb-2">You're all set!</h2>
              <p className="text-amber-600 mb-6">Ready to start rating amazing hot chocolates?</p>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-amber-900 mb-3">Your Preferences:</h3>
                <div className="space-y-2 text-sm text-amber-700">
                  <p>
                    <strong>Favorite Types:</strong> {preferences.favoriteTypes.length} selected
                  </p>
                  <p>
                    <strong>Interests:</strong> {preferences.interests.length} selected
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  Get Started
                  <Coffee className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
