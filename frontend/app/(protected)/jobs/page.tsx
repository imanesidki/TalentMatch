import { Button } from "@/components/ui/button"
import { JobList } from "@/components/job-list"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground">Manage your job postings and view candidate matches.</p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Job
          </Link>
        </Button>
      </div>
      <JobList />
    </div>
  )
}

