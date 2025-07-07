'use client'

import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, MapPin, Save, Sparkles, Zap, CheckCircle } from 'lucide-react'
import NextImage from 'next/image'

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

  const [photo, setPhoto] = useState<string>('')
  const [location, setLocation] = useState({
    lat: 0,
    lng: 0,
    name: '',
  })
  const [ratings, setRatings] = useState<RatingData>({
    temperature: 3,
    sweetness: 3,
    texture: 3,
    chocolate: 3,
    creaminess: 3,
    presentation: 3,
  })
  const [notes, setNotes] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<
    { name: string; lat: number; lon: number }[]
  >([])
  const [manualSearch, setManualSearch] = useState(false)

  useEffect(() => {
    if (!manualSearch) return
    if (searchQuery.trim().length < 3) {
      setSuggestions([])
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'Accept-Language': 'en' },
        })
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setSuggestions(
          (data as any[]).slice(0, 5).map((item) => ({
            name: item.display_name as string,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
          })),
        )
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Search failed', err)
        }
      }
    }, 500)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [searchQuery, manualSearch])

  const compressImage = (
    dataUrl: string,
    maxSize = 1000,
    quality = 0.7,
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        } else {
          resolve(dataUrl)
        }
      }
      img.onerror = () => resolve(dataUrl)
      img.src = dataUrl
    })
  }

  const fetchCafeName = async (lat: number, lng: number): Promise<string> => {
    try {
      const query = `[out:json];node(around:100,${lat},${lng})[amenity=cafe];out 1;`
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      const res = await fetch(url)
      const data = await res.json()
      return data.elements?.[0]?.tags?.name || ''
    } catch (err) {
      console.error('Failed to detect cafe name', err)
      return ''
    }
  }

  const fetchNearbyCafes = async (
    lat: number,
    lng: number,
  ): Promise<{ name: string; lat: number; lon: number }[]> => {
    try {
      const query = `[out:json];node(around:300,${lat},${lng})[amenity=cafe];out;`
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      const res = await fetch(url)
      const data = await res.json()
      return (data.elements || [])
        .filter((el: any) => el.tags?.name)
        .slice(0, 5)
        .map((el: any) => ({
          name: el.tags.name as string,
          lat: el.lat,
          lon: el.lon,
        }))
    } catch (err) {
      console.error('Failed to fetch nearby cafes', err)
      return []
    }
  }

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const raw = e.target?.result as string
        const compressed = await compressImage(raw)
        setPhoto(compressed)
        setCurrentStep(2)
      }
      reader.readAsDataURL(file)
    }
  }

  const getLocation = () => {
    setIsGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          let cafe = ''
          let nearby: { name: string; lat: number; lon: number }[] = []
          try {
            const [foundCafe, foundNearby] = await Promise.all([
              fetchCafeName(lat, lng),
              fetchNearbyCafes(lat, lng),
            ])
            cafe = foundCafe
            nearby = foundNearby
          } catch (err) {
            console.error('Error fetching cafe info', err)
          }
          setLocation({ lat, lng, name: '' })
          setManualSearch(false)
          if (nearby.length > 0) {
            const list = cafe
              ? [{ name: cafe, lat, lon: lng }, ...nearby]
              : nearby
            setSuggestions(list)
            setSearchQuery('')
          }
          setIsGettingLocation(false)
          if (currentStep === 2) setCurrentStep(3)
        },
        (error) => {
          console.error('Error getting location:', error)
          setIsGettingLocation(false)
        },
      )
    } else {
      setIsGettingLocation(false)
    }
  }

  const handleRatingChange = (
    characteristic: keyof RatingData,
    value: number,
  ) => {
    setRatings((prev) => ({
      ...prev,
      [characteristic]: value,
    }))
  }

  const handleSave = async () => {
    if (!photo) {
      alert('Please take a photo first!')
      return
    }

    setIsSaving(true)
    let errorMessage = ''

    // Simulate API call delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const currentUserRaw = localStorage.getItem('currentUser')
    let userId: string | undefined
    if (currentUserRaw) {
      try {
        const parsed = JSON.parse(currentUserRaw)
        if (parsed && typeof parsed.id === 'string') {
          userId = parsed.id
        }
      } catch (err) {
        console.error('Failed to parse current user info', err)
        errorMessage = 'Failed to read user information.'
      }
    }

    const newRating = {
      id: crypto.randomUUID(),
      userId,
      photo,
      location,
      ratings,
      notes,
      timestamp: new Date().toISOString(),
    }

    let existingRatings: any[] = []
    try {
      const stored = localStorage.getItem('hotChocRatings')
      if (stored) {
        existingRatings = JSON.parse(stored)
        if (!Array.isArray(existingRatings)) {
          existingRatings = []
        }
      }
    } catch (err) {
      console.error('Failed to read ratings from localStorage', err)
      errorMessage = 'Failed to read saved ratings.'
      existingRatings = []
    }

    const updatedRatings = [newRating, ...existingRatings]

    try {
      localStorage.setItem('hotChocRatings', JSON.stringify(updatedRatings))
    } catch (err: any) {
      console.error('Failed to save rating', err)
      if (
        err?.name === 'QuotaExceededError' ||
        err?.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      ) {
        errorMessage =
          'Storage limit reached. Please remove old ratings or use smaller photos.'
      } else {
        errorMessage = 'Failed to save rating.'
      }
    }

    setIsSaving(false)
    if (errorMessage) {
      alert(errorMessage)
    } else {
      setShowSuccess(true)

      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  }

  const ratingLabels = {
    temperature: {
      min: 'Cold',
      max: 'Hot',
      icon: '🌡️',
      color: 'from-blue-400 to-red-400',
    },
    sweetness: {
      min: 'Bland',
      max: 'Sweet',
      icon: '🍯',
      color: 'from-gray-400 to-yellow-400',
    },
    texture: {
      min: 'Thin',
      max: 'Thick',
      icon: '🥛',
      color: 'from-blue-300 to-amber-300',
    },
    chocolate: {
      min: 'Mild',
      max: 'Rich',
      icon: '🍫',
      color: 'from-amber-400 to-amber-800',
    },
    creaminess: {
      min: 'Light',
      max: 'Creamy',
      icon: '🥛',
      color: 'from-white to-amber-200',
    },
    presentation: {
      min: 'Plain',
      max: 'Beautiful',
      icon: '✨',
      color: 'from-gray-300 to-purple-400',
    },
  }

  const stepProgress = ((currentStep - 1) / 4) * 100

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center animate-bounce">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Rating Saved!
          </h2>
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
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition-all duration-500 ${currentStep >= 1 ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-amber-900">
                📸 Capture the Moment
              </h2>
            </div>

            {photo ? (
              <div className="relative group">
                <NextImage
                  src={photo || '/placeholder.svg'}
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
                <span className="text-sm text-amber-500 mt-1">
                  Tap to capture your hot chocolate
                </span>
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
            className={`relative z-50 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition-all duration-500 ${currentStep >= 2 ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-amber-900">
                📍 Where was this?
              </h2>
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
                  placeholder="Search address or cafe..."
                  value={searchQuery}
                  onChange={(e) => {
                    setManualSearch(true)
                    setSearchQuery(e.target.value)
                    setLocation((prev) => ({ ...prev, name: e.target.value }))
                  }}
                  className="w-full p-4 border border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  onFocus={() => setCurrentStep(Math.max(currentStep, 3))}
                />
                {location.name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
                {suggestions.length > 0 && (
                  <ul className="absolute z-[100] mt-1 left-0 right-0 bg-white rounded-xl border shadow-lg max-h-60 overflow-auto">
                    <li className="p-2 text-xs font-semibold text-amber-700 sticky top-0 bg-white border-b">
                      Nearby Places
                    </li>
                    {suggestions.map((s) => (
                      <li
                        key={`${s.lat}-${s.lon}`}
                        onClick={() => {
                          setLocation({ lat: s.lat, lng: s.lon, name: s.name })
                          setSearchQuery(s.name)
                          setSuggestions([])
                          setCurrentStep(Math.max(currentStep, 3))
                        }}
                        className="p-2 cursor-pointer hover:bg-amber-100"
                      >
                        {s.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {location.lat !== 0 && location.lng !== 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Coordinates: {location.lat.toFixed(4)},{' '}
                  {location.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>

          {/* Ratings */}
          <div
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition-all duration-500 ${currentStep >= 3 ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-amber-900">
                ⭐ Rate the Experience
              </h2>
            </div>

            <div className="space-y-6">
              {Object.entries(ratings).map(([key, value]) => (
                <div key={key} className="group">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {ratingLabels[key as keyof typeof ratingLabels].icon}
                      </span>
                      <label className="font-medium text-amber-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-amber-600">
                        {value}
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              i < value
                                ? 'bg-amber-400 scale-110'
                                : 'bg-amber-200'
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
                      onChange={(e) =>
                        handleRatingChange(
                          key as keyof RatingData,
                          Number.parseInt(e.target.value),
                        )
                      }
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
                    <span>
                      {ratingLabels[key as keyof typeof ratingLabels].min}
                    </span>
                    <span>
                      {ratingLabels[key as keyof typeof ratingLabels].max}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition-all duration-500 ${currentStep >= 4 ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-amber-900">
                📝 Your Thoughts
              </h2>
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
