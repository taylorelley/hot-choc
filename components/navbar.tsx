"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Home, Plus, Search, User, Coffee, Bell, LogIn, UserPlus, Compass, type LucideIcon } from "lucide-react"

interface NavbarUser {
  id: string
  name: string
  avatar: string
}

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  href?: string
  onClick?: () => void
  isActive: boolean
  isSpecial?: boolean
  showAvatar?: boolean
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<NavbarUser | null>(null)
  const [notifications, setNotifications] = useState(3) // Mock notification count
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      setUser(userData)
    }
  }, [pathname]) // Re-check user on route changes

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY > lastScrollY.current && currentY > 50) {
        setVisible(false)
      } else if (currentY < lastScrollY.current) {
        setVisible(true)
      }
      lastScrollY.current = currentY
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Don't show navbar on auth pages and onboarding
  const hideNavbarRoutes = ["/auth/login", "/auth/signup", "/onboarding", "/auth/forgot-password"]
  if (hideNavbarRoutes.includes(pathname)) {
    return null
  }

  const handleAuthAction = (action: "login" | "signup") => {
    router.push(`/auth/${action}`)
  }

  const navItems: NavItem[] = user
    ? [
        {
          id: "home",
          label: "Home",
          icon: Home,
          href: "/",
          isActive: pathname === "/",
        },
        {
          id: "dashboard",
          label: "Dashboard",
          icon: Coffee,
          href: "/dashboard",
          isActive: pathname === "/dashboard",
        },
        {
          id: "new",
          label: "Rate",
          icon: Plus,
          href: "/new",
          isActive: pathname === "/new",
          isSpecial: true, // This will be the main CTA button
        },
        {
          id: "explore",
          label: "Explore",
          icon: Compass,
          href: "/explore",
          isActive: pathname === "/explore",
        },
        {
          id: "profile",
          label: "Profile",
          icon: User,
          href: "/profile/settings",
          isActive: pathname.startsWith("/profile"),
          showAvatar: true,
        },
      ]
    : [
        {
          id: "home",
          label: "Home",
          icon: Home,
          href: "/",
          isActive: pathname === "/",
        },
        {
          id: "explore",
          label: "Explore",
          icon: Search,
          href: "/explore",
          isActive: pathname === "/explore",
        },
        {
          id: "login",
          label: "Login",
          icon: LogIn,
          onClick: () => handleAuthAction("login"),
          isActive: false,
        },
        {
          id: "signup",
          label: "Sign Up",
          icon: UserPlus,
          onClick: () => handleAuthAction("signup"),
          isActive: false,
          isSpecial: true,
        },
      ]

  return (
    <>
      {/* Bottom Navigation */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-2">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const Icon = item.icon

                if (item.onClick) {
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 min-w-[60px] ${
                        item.isSpecial
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105"
                          : item.isActive
                            ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700"
                            : "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${item.isSpecial ? "w-6 h-6" : ""}`} />
                      <span className={`text-xs font-medium ${item.isSpecial ? "text-xs" : "text-[10px]"}`}>
                        {item.label}
                      </span>
                    </button>
                  )
                }

                return (
                  <Link key={item.id} href={item.href || "/"}>
                    <button
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 min-w-[60px] ${
                        item.isSpecial
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105"
                          : item.isActive
                            ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700"
                            : "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                      }`}
                    >
                      {/* Special handling for profile with avatar */}
                      {item.showAvatar && user ? (
                        <div className="relative mb-1">
                          <Image
                            src={user.avatar || "/placeholder.svg?height=24&width=24"}
                            alt={user.name}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full object-cover border-2 border-current"
                          />
                          {item.isActive && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                      ) : (
                        <Icon className={`mb-1 ${item.isSpecial ? "w-6 h-6" : "w-5 h-5"}`} />
                      )}

                      <span className={`font-medium ${item.isSpecial ? "text-xs" : "text-[10px]"}`}>{item.label}</span>

                      {/* Active indicator */}
                      {item.isActive && !item.isSpecial && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full"></div>
                      )}

                      {/* Notification badge for specific items */}
                      {item.id === "explore" && notifications > 0 && user && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {notifications > 9 ? "9+" : notifications}
                        </div>
                      )}
                    </button>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Top Notification Bar (when logged in) */}
      {user && pathname === "/dashboard" && (
        <div className="fixed top-0 left-0 right-0 z-40 px-4 pt-4">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-xl text-white rounded-2xl p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" />
                  <span className="text-sm font-medium">Welcome back, {user.name.split(" ")[0]}!</span>
                </div>
                <button className="text-white/80 hover:text-white transition-colors">
                  <span className="text-xs">Dismiss</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (alternative design for new rating) */}
      {user && !pathname.includes("/new") && (
        <Link href="/new">
          <button className="fixed bottom-24 right-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-40 md:hidden">
            <Plus className="w-6 h-6" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-ping opacity-20"></div>
          </button>
        </Link>
      )}

      {/* Spacer to prevent content from being hidden behind navbar */}
      <div className="h-20"></div>
    </>
  )
}
