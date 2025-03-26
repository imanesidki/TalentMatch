"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Reset state on pathname change
    setIsChecking(true)
    setIsAuthorized(false)
    
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const authenticated = isAuthenticated()
        
        if (!authenticated) {
          // Redirect to login page with callback URL
          router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
        } else {
          setIsAuthorized(true)
          setIsChecking(false)
        }
      }
    }

    // Run immediately and also set up an interval
    checkAuth()
    
    // Set up a timer to handle async operations
    const timer = setTimeout(() => {
      if (isChecking) {
        checkAuth()
      }
    }, 500)
    
    return () => {
      clearTimeout(timer)
    }
  }, [router, pathname])

  // Show loading spinner during check
  if (isChecking || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Only render children if authorized
  return <>{children}</>
} 