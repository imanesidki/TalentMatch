"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout()
      } catch (error) {
        console.error('Logout failed:', error)
      } finally {
        // Ensure redirect happens even if there was an error
        router.push('/signin')
      }
    }

    performLogout()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Logging out...</h1>
        <p className="text-muted-foreground">Please wait while we log you out.</p>
      </div>
    </div>
  )
} 