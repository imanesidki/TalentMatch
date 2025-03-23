"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobDetails } from "@/components/job-details"
import { JobCandidates } from "@/components/job-candidates"
import { JobSettings } from "@/components/job-settings"
import { createQueryString, useQueryString } from "@/lib/use-query-string"
import { useRouter, usePathname } from "next/navigation"

interface JobTabsProps {
  jobId: string
  defaultTab?: string
}

export default function JobTabs({ jobId, defaultTab }: JobTabsProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Determine the active tab based on the URL params or default to "details"
  const activeTab = defaultTab || "details"

  // Handle tab change to update the URL
  const handleTabChange = (value: string) => {
    // Only add tab param if not the default tab
    const newQueryString = value === "details"
      ? "" // Remove the tab param if switching to the default tab
      : `?tab=${value}`
    
    // Update the URL with the new query string
    router.push(`${pathname}${newQueryString}`)
  }

  return (
    <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="details">Job Details</TabsTrigger>
        <TabsTrigger value="matches">Candidates</TabsTrigger>
        <TabsTrigger value="settings">Match Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="mt-4">
        <JobDetails jobId={jobId} />
      </TabsContent>
      <TabsContent value="matches" className="mt-4">
        <JobCandidates />
      </TabsContent>
      <TabsContent value="settings" className="mt-4">
        <JobSettings />
      </TabsContent>
    </Tabs>
  )
} 