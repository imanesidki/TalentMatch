"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { getToken } from "@/lib/auth"

type DashboardStats = {
  total_candidates: number
  new_candidates: number
  active_jobs: number
  new_jobs: number
}

type RecentCandidate = {
  id: number
  name: string
  email: string
  job: string
  score: number | null
}

type JobPosting = {
  id: number
  title: string
  type: string
  department: string
  location: string
  created_at: string
  candidate_count: number
  avg_score: number | null
}

type ActivityData = {
  matches: number[]
  applications: number[]
}

type CurrentUser = {
  id: number
  firstname: string
  lastname: string
  email: string
  is_active: boolean
}

interface AppDataContextType {
  isLoading: boolean
  stats: DashboardStats | null
  recentCandidates: RecentCandidate[]
  jobPostings: JobPosting[]
  activityData: ActivityData | null
  currentUser: CurrentUser | null
  refreshData: () => Promise<void>
}

const defaultContextValue: AppDataContextType = {
  isLoading: true,
  stats: null,
  recentCandidates: [],
  jobPostings: [],
  activityData: null,
  currentUser: null,
  refreshData: async () => {}
}

const AppDataContext = createContext<AppDataContextType>(defaultContextValue)

export function useAppData() {
  return useContext(AppDataContext)
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentCandidates, setRecentCandidates] = useState<RecentCandidate[]>([])
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [activityData, setActivityData] = useState<ActivityData | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  const fetchDashboardData = async () => {
    const token = getToken()
    
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      
      const results = await Promise.allSettled([
        fetch(`${apiUrl}/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }),
        
        fetch(`${apiUrl}/dashboard/recent-candidates`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }),
        
        fetch(`${apiUrl}/dashboard/job-postings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }),
        
        fetch(`${apiUrl}/dashboard/activity`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }),
        
        fetch(`${apiUrl}/dashboard/user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ])
      
      if (results[0].status === "fulfilled" && results[0].value.ok) {
        const statsData = await results[0].value.json()
        setStats(statsData)
      }
      
      if (results[1].status === "fulfilled" && results[1].value.ok) {
        const candidatesData = await results[1].value.json()
        setRecentCandidates(candidatesData)
      }
      
      if (results[2].status === "fulfilled" && results[2].value.ok) {
        const jobsData = await results[2].value.json()
        setJobPostings(jobsData)
      }
      
      if (results[3].status === "fulfilled" && results[3].value.ok) {
        const activityData = await results[3].value.json()
        setActivityData(activityData)
      }
      
      if (results[4].status === "fulfilled" && results[4].value.ok) {
        const userData = await results[4].value.json()
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    
    return () => clearInterval(refreshInterval)
  }, [])

  const contextValue: AppDataContextType = {
    isLoading,
    stats,
    recentCandidates,
    jobPostings,
    activityData,
    currentUser,
    refreshData: fetchDashboardData
  }

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  )
} 