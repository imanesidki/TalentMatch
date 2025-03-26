import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentCandidates } from "@/components/recent-candidates"
import { JobPostings } from "@/components/job-postings"

export default function DashboardPage() {
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
                <div className="text-2xl font-bold">1,284</div>
                <p className="text-xs text-muted-foreground">+24 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
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

