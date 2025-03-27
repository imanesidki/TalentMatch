"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
  toggleSidebar: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

interface SidebarProviderProps {
  children: ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(!isOpen)
  const close = () => setIsOpen(false)

  return (
    <SidebarContext.Provider value={{ 
      isOpen, 
      toggle, 
      toggleSidebar: toggle,
      close 
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

