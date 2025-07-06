import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/navbar"

export const metadata: Metadata = {
  title: "Hot Choc Rater - Rate & Discover Amazing Hot Chocolates",
  description: "Discover, rate, and share your favorite hot chocolate experiences with the community",
  keywords: "hot chocolate, rating, coffee, drinks, reviews, community",
  authors: [{ name: "Hot Choc Rater Team" }],
  openGraph: {
    title: "Hot Choc Rater",
    description: "Rate & Discover Amazing Hot Chocolates",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main className="relative">
          {children}
          <Navbar />
        </main>
      </body>
    </html>
  )
}
