"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { getJobs } from "@/lib/api/jobs"
import { toast } from "sonner"

export function JobList() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const data = await getJobs()
        setJobs(data)
      } catch (error) {
        console.error("Error fetching jobs:", error)
        toast.error("Failed to load jobs")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="mb-4 text-center text-muted-foreground">No job postings found</p>
          <Button asChild>
            <Link href="/jobs/new">Create Your First Job Posting</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.job_id || job.id}>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex-1 space-y-2">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <h3 className="font-semibold">
                    <Link href={`/jobs/${job.job_id || job.id}`} className="hover:underline">
                      {job.title}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      {job.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Posted: {new Date(job.created_at || job.posted).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  {job.department} • {job.location} • {job.type}
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{job.candidates || 0} Candidates</Badge>
                </div>
              </div>

              <div className="flex gap-2 sm:flex-col">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/jobs/${job.job_id || job.id}`}>View Details</Link>
                </Button>
                <Button size="sm" className="w-full" asChild>
                  <Link href={`/jobs/${job.job_id || job.id}?tab=matches`}>View Matches</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

