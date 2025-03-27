import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { JobForm } from "@/components/job-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getJob } from "@/lib/api/jobs"

export default async function EditJobPage({ params }: { params: { id: string } }) {
  const jobId = await params.id
  
  // Fetch job data from the API
  const job = await getJob(jobId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/jobs/${jobId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Job</h1>
        </div>
      </div>

      <Card>
        <JobForm isEditing jobId={jobId} jobData={job} />
      </Card>
    </div>
  )
}

