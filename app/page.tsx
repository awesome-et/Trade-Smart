'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // The middleware will handle auth checks and redirect
    // For authenticated users, show the dashboard
    // Just refresh to let middleware do its job
    router.refresh()
  }, [router])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="mb-4 text-2xl font-bold text-foreground">Trading Engine</div>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
