import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const jobs = [
  {
    id: "1",
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    candidates: 24,
    status: "active",
    posted: "June 15, 2023",
    description:
      "We're looking for a Senior Software Engineer to join our team and help build scalable web applications...",
  },
  {
    id: "2",
    title: "Product Manager",
    department: "Product",
    location: "New York, NY",
    type: "Full-time",
    candidates: 18,
    status: "active",
    posted: "June 10, 2023",
    description:
      "As a Product Manager, you'll work closely with engineering, design, and business teams to define product strategy...",
  },
  {
    id: "3",
    title: "UX Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    candidates: 12,
    status: "active",
    posted: "June 5, 2023",
    description:
      "We're seeking a talented UX Designer to create intuitive and engaging user experiences for our products...",
  },
  {
    id: "4",
    title: "Data Scientist",
    department: "Data",
    location: "Boston, MA",
    type: "Full-time",
    candidates: 8,
    status: "active",
    posted: "June 1, 2023",
    description:
      "Join our data science team to analyze complex datasets and build machine learning models that drive business decisions...",
  },
]

export function JobList() {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id}>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex-1 space-y-2">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <h3 className="font-semibold">
                    <Link href={`/jobs/${job.id}`} className="hover:underline">
                      {job.title}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      {job.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Posted: {job.posted}</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  {job.department} • {job.location} • {job.type}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{job.candidates} Candidates</Badge>
                </div>
              </div>

              <div className="flex gap-2 sm:flex-col">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/jobs/${job.id}`}>View Details</Link>
                </Button>
                <Button size="sm" className="w-full" asChild>
                  <Link href={`/jobs/${job.id}?tab=matches`}>View Matches</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

