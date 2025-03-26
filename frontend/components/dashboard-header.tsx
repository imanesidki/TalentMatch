"use client"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/sidebar-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu } from "lucide-react"
import { getAuthUser } from "@/lib/auth"
import { useEffect, useState } from "react"

export function DashboardHeader() {
  const { toggle } = useSidebar()
  const [user, setUser] = useState<{ email: string; firstname?: string; lastname?: string } | null>(null)
  
  useEffect(() => {
    // Get user data from auth
    const userData = getAuthUser()
    
    // Fetch the user profile if we have a user
    if (userData) {
      // Get current user's full profile
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Failed to fetch user profile')
      })
      .then(data => {
        setUser(data)
      })
      .catch(err => {
        console.error('Error fetching user profile:', err)
        setUser(userData)
      })
    }
  }, [])
  
  // Generate initials from user data
  const getInitials = () => {
    if (user?.firstname && user?.lastname) {
      return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase()
    }
    return 'U'
  }
  
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggle}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="flex-1"></div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder-user.jpg?height=32&width=32" alt="Avatar" />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
          
      </div>
    </header>
  )
}

