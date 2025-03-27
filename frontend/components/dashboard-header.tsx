"use client"
import { Button } from "@/components/ui/button"
import { useAppData } from "@/providers/app-data-provider"
import { useSidebar } from "@/components/sidebar-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu } from "lucide-react"

export function DashboardHeader() {
  const { isLoading, currentUser } = useAppData()
  const { toggle } = useSidebar()

  // Get user initials from name
  const getUserInitials = () => {
    if (!currentUser) return 'U'
    
    const firstname = currentUser.firstname || ''
    const lastname = currentUser.lastname || ''
    
    const initials = `${firstname.charAt(0)}${lastname.charAt(0)}`
    return initials.toUpperCase()
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggle}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="flex-1"></div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder-user.jpg?height=32&width=32" alt="Avatar" />
          <AvatarFallback>{getUserInitials()}</AvatarFallback>
        </Avatar>
          
      </div>
    </header>
  )
}

