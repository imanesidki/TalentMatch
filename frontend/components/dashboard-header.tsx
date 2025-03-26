"use client"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/sidebar-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu } from "lucide-react"
import { getAuthUser } from "@/lib/auth"

export function DashboardHeader() {
  const { toggle } = useSidebar()
  const user = getAuthUser()
  
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
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
          
      </div>
    </header>
  )
}

