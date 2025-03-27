import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Job } from "@/lib/api/jobs"

interface JobDetailsProps {
  jobId: string
  job?: Job
}

export function JobDetails({ jobId, job }: JobDetailsProps) {
  // If no job data was provided, display a message
  if (!job) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Job information not available.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {job.description || "No description provided."}
          </p>

          <div className="mt-4 space-y-4">
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div>
                <h3 className="font-semibold">Responsibilities:</h3>
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  {job.responsibilities.map((responsibility: string, index: number) => (
                    <li key={index}>{responsibility}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h3 className="font-semibold">Requirements:</h3>
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  {job.requirements.map((requirement: string, index: number) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.nice_to_have && job.nice_to_have.length > 0 && (
              <div>
                <h3 className="font-semibold">Nice to Have:</h3>
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  {job.nice_to_have.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {job.skills && job.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Required Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill: string, index: number) => (
                <Badge key={index}>{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {job.benefits && job.benefits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {job.benefits.map((benefit: string, index: number) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

