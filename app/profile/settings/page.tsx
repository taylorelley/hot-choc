"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Bell,
  Shield,
  Globe,
  Camera,
  Save,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  CircleUserRound,
} from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  preferences: {
    notifications: boolean
    publicProfile: boolean
    shareRatings: boolean
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(JSON.parse(currentUser))
  }, [router])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && user) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const updatedUser = { ...user, avatar: e.target?.result as string }
        setUser(updatedUser)
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    localStorage.setItem("currentUser", JSON.stringify(user))
    setIsLoading(false)
  }

  const handlePreferenceChange = (key: keyof UserProfile["preferences"], value: boolean) => {
    if (!user) return
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, [key]: value },
    }
    setUser(updatedUser)
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/auth/login")
  }

  const handleDeleteAccount = () => {
    // In a real app, this would make an API call
    localStorage.removeItem("currentUser")
    localStorage.removeItem("hotChocRatings")
    router.push("/auth/signup")
  }

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert("New passwords don't match")
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setPasswordData({ current: "", new: "", confirm: "" })
    setShowChangePassword(false)
    setIsLoading(false)
    alert("Password changed successfully!")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "account", label: "Account", icon: Globe },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-rose-200/20 to-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-amber-600">Manage your account</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2 mb-6">
          <div className="grid grid-cols-4 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                      : "text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "profile" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-amber-900 mb-6">Profile Information</h2>

              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={100}
                      height={100}
                      className="w-24 h-24 rounded-full object-cover border-4 border-amber-200"
                    />
                  ) : (
                    <span
                      className="w-24 h-24 flex items-center justify-center border-4 border-amber-200 rounded-full"
                      role="img"
                      aria-label="No avatar"
                    >
                      <CircleUserRound className="w-16 h-16 text-amber-500" />
                    </span>
                  )}
                  <button
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                    className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-full shadow-lg hover:bg-amber-600 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-amber-900 mb-2">Full Name</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full p-4 border border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Email */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-amber-900 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 border border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-amber-900 mb-6">Notification Preferences</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-amber-900">Push Notifications</h3>
                    <p className="text-sm text-amber-600">Get notified about new features and updates</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange("notifications", !user.preferences.notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      user.preferences.notifications ? "bg-amber-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        user.preferences.notifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-amber-900">Email Updates</h3>
                    <p className="text-sm text-amber-600">Receive weekly summaries and tips</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-amber-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-amber-900 mb-6">Privacy Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-amber-900">Public Profile</h3>
                    <p className="text-sm text-amber-600">Allow others to see your profile and ratings</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange("publicProfile", !user.preferences.publicProfile)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      user.preferences.publicProfile ? "bg-amber-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        user.preferences.publicProfile ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-amber-900">Share Ratings</h3>
                    <p className="text-sm text-amber-600">Allow your ratings to appear in community feeds</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange("shareRatings", !user.preferences.shareRatings)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      user.preferences.shareRatings ? "bg-amber-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        user.preferences.shareRatings ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-amber-900 mb-4">Account Security</h2>

                {!showChangePassword ? (
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    Change Password
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-900 mb-2">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.current}
                          onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                          className="w-full pl-12 pr-12 py-3 border border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-white/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-500"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-amber-900 mb-2">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.new}
                          onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                          className="w-full pl-12 pr-12 py-3 border border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-white/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-500"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-amber-900 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                          className="w-full pl-12 pr-12 py-3 border border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-white/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-500"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowChangePassword(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleChangePassword}
                        disabled={isLoading}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
                      >
                        {isLoading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>

              {/* Delete Account */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-red-200">
                <h3 className="text-lg font-bold text-red-800 mb-2">Danger Zone</h3>
                <p className="text-red-600 text-sm mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-red-700 font-medium">Are you absolutely sure?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Forever
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
