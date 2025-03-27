"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentCandidates } from "@/components/recent-candidates"
import { JobPostings } from "@/components/job-postings"
import { useAppData } from "@/providers/app-data-provider"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { isLoading, stats } = useAppData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your recruitment activities and candidate matches.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Left column */}
        <div className="space-y-4 md:col-span-1 lg:col-span-4">
          {/* stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.total_candidates || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +{stats?.new_candidates || 0} from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.active_jobs || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +{stats?.new_jobs || 0} from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Candidate matching activity for the past 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <Overview />
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - recent candidates */}
        <Card className="md:col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Candidates</CardTitle>
            <CardDescription>Recently added candidates and their match scores.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentCandidates />
          </CardContent>
        </Card>
      </div>
      
      {/* job postings */} 
      <Card>
        <CardHeader>
          <CardTitle>Job Postings</CardTitle>
          <CardDescription>Your active job postings and candidate matches.</CardDescription>
        </CardHeader>
        <CardContent>
          <JobPostings />
        </CardContent>
      </Card>
    </div>
  )
}

