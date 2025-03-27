"use client"

import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Candidate } from "@/types/candidate"
import { CandidateProfile } from "@/components/candidate-profile"
import { CandidateSkillMatch } from "@/components/candidate-skill-match"
import { CandidateNotes } from "@/components/candidate-notes"
import { CandidateResume } from "@/components/candidate-resume"

// Define the Candidate type to match our API response
type Resume = {
  resume_id: number
  job_id: number
  summary?: string | null
  skills: string[]
  experience?: string | null
  education?: string | null
  file_path?: string | null
  created_at: string
  updated_at: string
}

interface CandidateTabsProps {
  candidate: Candidate | null
  candidateId?: string
}

export function CandidateTabs({ candidate, candidateId }: CandidateTabsProps) {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "profile"

  if (!candidate) return null

  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
         <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="skill-match">Skill Match</TabsTrigger>
        <TabsTrigger value="resume">Resume</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-4">
        <CandidateProfile candidate={candidate} />
      </TabsContent>
      <TabsContent value="skill-match" className="space-y-4">
        <CandidateSkillMatch candidate={candidate} />
      </TabsContent>
      <TabsContent value="resume" className="space-y-4">
        <CandidateResume candidate={candidate} />
      </TabsContent>
      <TabsContent value="notes" className="space-y-4">
        <CandidateNotes candidateId={candidateId} />
      </TabsContent>
    </Tabs>
  )
}

