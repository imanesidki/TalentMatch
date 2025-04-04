'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, logout, getAuthUser } from '@/lib/auth'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: { email: string } | null
}

export function useAuth(redirectIfNotAuthenticated = true) {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null
  })

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const authenticated = isAuthenticated()
        const user = authenticated ? getAuthUser() : null

        setAuthState({
          isAuthenticated: authenticated,
          isLoading: false,
          user
        })

        // If not authenticated and redirectIfNotAuthenticated is true, redirect to signin
        if (!authenticated && redirectIfNotAuthenticated) {
          router.push(`/signin?redirect=${encodeURIComponent(window.location.pathname)}`)
        }
      } catch (error) {
        console.log('Error checking authentication:', error)
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null
        })
      }
    }

    checkAuth()
  }, [router, redirectIfNotAuthenticated])

  const handleLogout = () => {
    logout()
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null
    })
  }

  return {
    ...authState,
    logout: handleLogout
  }
} 