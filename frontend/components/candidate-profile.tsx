import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Candidate } from "@/types/candidate"

interface CandidateProfileProps {
  candidate: Candidate
}

export function CandidateProfile({ candidate }: CandidateProfileProps) {
  return (
    <div className="space-y-6">
      <Card>
      <CardHeader>
          <CardTitle>AI-Generated Resume Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-md text-muted-foreground">
            {candidate.summary || "No summary available"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            {candidate.experience ? (
              <p className="text-md text-muted-foreground">{candidate.experience}</p>
            ) : (
              <p className="text-md text-muted-foreground">No experience information available</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            {candidate.education ? (
              <p className="text-md text-muted-foreground">{candidate.education}</p>
            ) : (
              <p className="text-md text-muted-foreground">No education information available</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

