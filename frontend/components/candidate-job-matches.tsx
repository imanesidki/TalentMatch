import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

const jobMatches = [
  {
    id: "1",
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    score: 92,
    skills: {
      matching: 6,
      missing: 2,
      total: 8,
    },
  },
  {
    id: "2",
    title: "Frontend Developer",
    department: "Engineering",
    location: "Remote",
    score: 85,
    skills: {
      matching: 5,
      missing: 2,
      total: 7,
    },
  },
  {
    id: "3",
    title: "Full Stack Developer",
    department: "Product",
    location: "New York, NY",
    score: 78,
    skills: {
      matching: 7,
      missing: 3,
      total: 10,
    },
  },
  {
    id: "4",
    title: "JavaScript Developer",
    department: "Engineering",
    location: "Boston, MA",
    score: 75,
    skills: {
      matching: 4,
      missing: 2,
      total: 6,
    },
  },
]

export function CandidateJobMatches() {
  return (
    <div className="space-y-4">
      {jobMatches.map((job) => (
        <Card key={job.id}>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1 space-y-2">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <h3 className="font-semibold">
                    <Link href={`/jobs/${job.id}`} className="hover:underline">
                      {job.title}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        job.score >= 85 ? "text-green-500" : job.score >= 75 ? "text-amber-500" : "text-red-500"
                      }`}
                    >
                      {job.score}% Match
                    </span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  {job.department} • {job.location}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>
                      Skills Match: {job.skills.matching}/{job.skills.total}
                    </span>
                    <span>{Math.round((job.skills.matching / job.skills.total) * 100)}%</span>
                  </div>
                  <Progress value={(job.skills.matching / job.skills.total) * 100} className="h-2" />
                </div>
              </div>

              <div className="flex gap-2 sm:flex-col">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/jobs/${job.id}`}>View Job</Link>
                </Button>
                <Button size="sm" className="w-full">
                  Apply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

