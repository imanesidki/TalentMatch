"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import { Candidate } from "@/types/candidate"

interface CandidateSkillMatchProps {
  candidate: Candidate
}

// Sample radar data - in a real app, this might be calculated based on the candidate skills
const skillRadarData = [
  { subject: "Frontend", candidate: 90, required: 85, fullMark: 100 },
  { subject: "Backend", candidate: 85, required: 80, fullMark: 100 },
  { subject: "DevOps", candidate: 70, required: 60, fullMark: 100 },
  { subject: "Databases", candidate: 75, required: 70, fullMark: 100 },
  { subject: "Testing", candidate: 80, required: 75, fullMark: 100 },
  { subject: "Architecture", candidate: 85, required: 90, fullMark: 100 },
]

export function CandidateSkillMatch({ candidate }: CandidateSkillMatchProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Skill Match Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="matching">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matching">Matching Skills</TabsTrigger>
              <TabsTrigger value="missing">Missing Skills</TabsTrigger>
              <TabsTrigger value="extra">Extra Skills</TabsTrigger>
            </TabsList>
            <TabsContent value="matching" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {candidate.matching_skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                    {skill}
                  </Badge>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                The candidate matches {candidate.matching_skills.length} skills.
              </p>
            </TabsContent>
            <TabsContent value="missing" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {candidate.missing_skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                    {skill}
                  </Badge>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                The candidate is missing {candidate.missing_skills.length} required skills.
              </p>
            </TabsContent>
            <TabsContent value="extra" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {candidate.extra_skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                    {skill}
                  </Badge>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                The candidate has {candidate.extra_skills.length} additional skills that may be valuable.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skill Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Candidate"
                  dataKey="candidate"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Required"
                  dataKey="required"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary"></div>
              <span className="text-sm">Candidate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-muted-foreground"></div>
              <span className="text-sm">Required</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

