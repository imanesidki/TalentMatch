"use client"

import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CandidateProfile } from "@/components/candidate-profile"
import { CandidateSkillMatch } from "@/components/candidate-skill-match"
import { CandidateResume } from "@/components/candidate-resume"
import { CandidateNotes } from "@/components/candidate-notes"
import { CandidateJobMatches } from "@/components/candidate-job-matches"

interface CandidateTabsProps {
  candidateId: string
}

export function CandidateTabs({ candidateId }: CandidateTabsProps) {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "profile"

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="resume">Resume</TabsTrigger>
        <TabsTrigger value="matches">Job Matches</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-4">
        <CandidateProfile />
      </TabsContent>
      <TabsContent value="skills" className="mt-4">
        <CandidateSkillMatch />
      </TabsContent>
      <TabsContent value="resume" className="mt-4">
        <CandidateResume />
      </TabsContent>
      <TabsContent value="matches" className="mt-4">
        <CandidateJobMatches />
      </TabsContent>
      <TabsContent value="notes" className="mt-4">
        <CandidateNotes />
      </TabsContent>
    </Tabs>
  )
}

