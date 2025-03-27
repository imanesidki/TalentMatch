"use client"

import { SidebarProvider } from "@/components/sidebar-provider"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import ProtectedRoute from "@/components/protected-route"
import { AppDataProvider } from "@/providers/app-data-provider"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <AppDataProvider>
        <SidebarProvider>
          <div className="flex flex-col h-screen">
            <DashboardHeader />
            <div className="flex flex-1 overflow-hidden">
              <DashboardSidebar />
              <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </AppDataProvider>
    </ProtectedRoute>
  )
}

