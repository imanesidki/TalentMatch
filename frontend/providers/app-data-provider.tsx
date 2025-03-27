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

// Define the Candidate type based on the API response
type Candidate = {
  candidate_id: number
  name: string
  email: string
  phone: string
  score: number
  summary: string
  skills: string[]
  experience: string
  education: string
  matching_skills: string[]
  missing_skills: string[]
  extra_skills: string[]
  created_at: string
  updated_at: string
}

interface AppDataContextType {
  isLoading: boolean
  stats: DashboardStats | null
  recentCandidates: RecentCandidate[]
  jobPostings: JobPosting[]
  activityData: ActivityData | null
  currentUser: CurrentUser | null
  refreshData: () => Promise<void>
  getCandidatesByJob: (jobId: number) => Promise<Candidate[]>
  getCandidateById: (candidateId: number) => Promise<Candidate | null>
}

const defaultContextValue: AppDataContextType = {
  isLoading: true,
  stats: null,
  recentCandidates: [],
  jobPostings: [],
  activityData: null,
  currentUser: null,
  refreshData: async () => {},
  getCandidatesByJob: async () => [],
  getCandidateById: async () => null
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

  const getCandidatesByJob = async (jobId: number): Promise<Candidate[]> => {
    try {
      const token = getToken()
      if (!token) return []

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      console.log(`Fetching candidates from: ${apiUrl}/candidates/job/${jobId}`);
      
      const response = await fetch(`${apiUrl}/candidates/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}): ${errorText}`);
        throw new Error(`Error fetching candidates: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Candidate data received:", data);
      return data
    } catch (error) {
      console.error("Error fetching candidates by job:", error)
      return []
    }
  }

  const getCandidateById = async (candidateId: number): Promise<Candidate | null> => {
    try {
      const token = getToken()
      if (!token) return null

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      const response = await fetch(`${apiUrl}/candidates/${candidateId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error fetching candidate: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching candidate by ID:", error)
      return null
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
    refreshData: fetchDashboardData,
    getCandidatesByJob,
    getCandidateById
  }

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  )
} 