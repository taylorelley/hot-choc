"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, MapPin, Save, Sparkles, Zap, CheckCircle } from "lucide-react"
import Image from "next/image"

interface RatingData {
  temperature: number
  sweetness: number
  texture: number
  chocolate: number
  creaminess: number
  presentation: number
}

export default function NewRatingPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photo, setPhoto] = useState<string>("")
  const [location, setLocation] = useState({
    lat: 0,
    lng: 0,
    name: "",
  })
  const [ratings, setRatings] = useState<RatingData>({
    temperature: 3,
    sweetness: 3,
    texture: 3,
    chocolate: 3,
    creaminess: 3,
    presentation: 3,
  })
  const [notes, setNotes] = useState("")
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhoto(e.target?.result as string)
        setCurrentStep(2)
      }
      reader.readAsDataURL(file)
    }
  }

  const getLocation = () => {
    setIsGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: location.name || `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          })
          setIsGettingLocation(false)
          if (currentStep === 2) setCurrentStep(3)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsGettingLocation(false)
        },
      )
    }
  }

  const handleRatingChange = (characteristic: keyof RatingData, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [characteristic]: value,
    }))
  }

  const handleSave = async () => {
    if (!photo) {
      alert("Please take a photo first!")
      return
    }

    setIsSaving(true)

    // Simulate API call delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newRating = {
      id: crypto.randomUUID(),
      photo,
      location,
      ratings,
      notes,
      timestamp: new Date().toISOString(),
    }

    const existingRatings = JSON.parse(localStorage.getItem("hotChocRatings") || "[]")
    const updatedRatings = [newRating, ...existingRatings]
    localStorage.setItem("hotChocRatings", JSON.stringify(updatedRatings))

    setIsSaving(false)
    setShowSuccess(true)

    setTimeout(() => {
      router.push("/")
    }, 2000)
  }

  const ratingLabels = {
    temperature: { min: "Cold", max: "Hot", icon: "🌡️", color: "from-blue-400 to-red-400" },
    sweetness: { min: "Bland", max: "Sweet", icon: "🍯", color: "from-gray-400 to-yellow-400" },
    texture: { min: "Thin", max: "Thick", icon: "🥛", color: "from-blue-300 to-amber-300" },
    chocolate: { min: "Mild", max: "Rich", icon: "🍫", color: "from-amber-400 to-amber-800" },
    creaminess: { min: "Light", max: "Creamy", icon: "🥛", color: "from-white to-amber-200" },
    presentation: { min: "Plain", max: "Beautiful", icon: "✨", color: "from-gray-300 to-purple-400" },
  }

  const stepProgress = ((currentStep - 1) / 4) * 100

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center animate-bounce">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Rating Saved!</h2>
          <p className="text-green-600">Redirecting you back...</p>
        </div>
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

      <div className="relative max-w-md mx-auto px-4 py-6">
        {/* Header with Progress */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
              New Rating
            </h1>
            <p className="text-amber-600 text-sm">Step {currentStep} of 4</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Photo Capture */}
          <div
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition-all duration-500 ${currentStep >= 1 ? "scale-100 opacity-100" : "scale-95 opacity-50"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-amber-900">📸 Capture the Moment</h2>
            </div>

            {photo ? (
              <div className="relative group">
                <Image
                  src={photo || "/placeholder.svg"}
                  alt="Hot chocolate"
                  width={400}
                  height={400}
                  className="w-full aspect-square object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/90 backdrop-blur-sm text-amber-900 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square border-2 border-dashed border-amber-300 rounded-xl flex flex-col items-center justify-center text-amber-600 hover:bg-amber-50/50 transition-all duration-300 hover:border-amber-400 group"
              >
                <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-8 h-8 text-amber-600" />
                </div>
                <span className="font-medium text-lg">Take Photo</span>
                <span className="text-sm text-amber-500 mt-1">Tap to capture your hot chocolate</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
          </div>

          {/* Location */}
          <div
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition-all duration-500 ${currentStep >= 2 ? "scale-100 opacity-100" : "scale-95 opacity-50"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-amber-900">📍 Where was this?</h2>
            </div>

            <div className="space-y-4">
              <button
                onClick={getLocation}
                disabled={isGettingLocation}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                {isGettingLocation ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Auto-Detect Location
                  </>
                )}
              </button>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Or enter location manually..."
                  value={location.name}
                  onChange={(e) => setLocation((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full p-4 border border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  onFocus={() => setCurrentStep(Math.max(currentStep, 3))}
                />
                {location.name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition-all duration-500 ${currentStep >= 3 ? "scale-100 opacity-100" : "scale-95 opacity-50"}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-amber-900">⭐ Rate the Experience</h2>
            </div>

            <div className="space-y-6">
              {Object.entries(ratings).map(([key, value]) => (
                <div key={key} className="group">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{ratingLabels[key as keyof typeof ratingLabels].icon}</span>
                      <label className="font-medium text-amber-900 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-amber-600">{value}</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              i < value ? "bg-amber-400 scale-110" : "bg-amber-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={value}
                      onChange={(e) => handleRatingChange(key as keyof RatingData, Number.parseInt(e.target.value))}
                      className="w-full h-3 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, 
                          rgb(251 191 36) 0%, 
                          rgb(251 191 36) ${(value / 5) * 100}%, 
                          rgb(254 243 199) ${(value / 5) * 100}%, 
                          rgb(254 243 199) 100%)`,
                      }}
                      onFocus={() => setCurrentStep(Math.max(currentStep, 4))}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-amber-600 mt-2">
                    <span>{ratingLabels[key as keyof typeof ratingLabels].min}</span>
                    <span>{ratingLabels[key as keyof typeof ratingLabels].max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition-all duration-500 ${currentStep >= 4 ? "scale-100 opacity-100" : "scale-95 opacity-50"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-amber-900">📝 Your Thoughts</h2>
            </div>

            <textarea
              placeholder="What made this hot chocolate special? Share your experience..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full p-4 border border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !photo}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-5 px-6 rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] text-lg"
          >
            {isSaving ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Your Rating...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Save Rating
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
