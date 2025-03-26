"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useSidebar } from "@/components/sidebar-provider"
import { cn } from "@/lib/utils"
import { BarChart, FileText, Home, Settings, LogOut } from "lucide-react"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Jobs",
    href: "/jobs",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ElementType
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col lg:space-y-1", className)} {...props}>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Button
            key={item.href}
            variant={pathname === item.href ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "justify-start",
              pathname === item.href ? "bg-secondary hover:bg-secondary" : "hover:bg-transparent hover:underline",
            )}
            asChild
          >
            <Link href={item.href}>
              <Icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}

export function DashboardSidebar() {
  const { isOpen, toggle, close } = useSidebar()
  const pathname = usePathname()

  React.useEffect(() => {
    close()
  }, [pathname, close])

  return (
    <>
      <aside className="w-64 flex-col border-r bg-background hidden lg:block ">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BarChart className="h-5 w-5 text-primary" />
            <span>TalentMatch</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-4">
          <SidebarNav items={sidebarNavItems} className="px-4" />
        </ScrollArea>
        <div className="fixed bottom-0 w-64 border-t p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
            <Link href="/logout">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Link>
          </Button>
        </div>
      </aside>

      <Sheet open={isOpen} onOpenChange={toggle}>
        <SheetContent side="left" className="flex flex-col w-64 p-0 sm:max-w-none">
          <SheetHeader className="hidden">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BarChart className="h-5 w-5 text-primary" />
              <span>TalentMatch</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 py-4">
            <SidebarNav items={sidebarNavItems} />
          </ScrollArea>
          <div className="mt-auto border-t p-4">
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/logout">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}