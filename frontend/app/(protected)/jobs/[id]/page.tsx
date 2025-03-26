import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Share, Upload } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import JobTabs from "@/components/job-tabs"

export default async function JobDetailsPage({ params, searchParams }: { 
  params: { id: string }, 
  searchParams: { tab?: string } 
}) {

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const jobId = resolvedParams.id
  const currentTab = resolvedSearchParams.tab || "details"
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Job Details</h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm" asChild>
            <Link href={`/jobs/${jobId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Job
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 min-h-screen">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Senior Software Engineer</CardTitle>
            <CardDescription>Engineering Department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <span className="text-sm font-medium">Location</span>
              <p className="text-sm">San Francisco, CA (Remote Available)</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium">Job Type</span>
              <p className="text-sm">Full-time</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium">Posted</span>
              <p className="text-sm">June 15, 2023</p>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Matched Candidates</span>
                <span className="text-sm font-medium text-primary">24</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          <Suspense fallback={<div>Loading...</div>}>
            <JobTabs jobId={jobId} defaultTab={currentTab} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

