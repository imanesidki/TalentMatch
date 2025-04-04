"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CandidateTabs } from "@/components/candidate-tabs"
import { Mail, Download } from "lucide-react"
import { Candidate } from "@/types/candidate"
import { useParams } from "next/navigation"

export default function CandidatePage() {
  // Use the Next.js hook for client components
  const params = useParams<{ id: string }>()
  const id = params.id
  
  console.log("Params:", params)
  console.log("Candidate ID:", id)
  
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8000/api/candidates/${id}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch candidate: ${response.statusText}`)
        }
        const data = await response.json()
        setCandidate(data)
      } catch (err) {
        console.log("Error fetching candidate:", err)
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCandidate()
    }
  }, [id])

  // Extract position from experience
  const getPosition = (experience?: string) => {
    if (!experience) return "Professional"
    const match = experience.match(/as an? (.+?) at/i) || experience.match(/in (.+?) at/i)
    return match ? match[1] : "Professional"
  }

  // Get education institution
  const getEducationInstitution = (education?: string) => {
    if (!education) return ""
    const parts = education.split("from ")
    return parts.length > 1 ? parts[1] : ""
  }

  if (loading) {
    return <div className="container mx-auto py-6">Loading candidate details...</div>
  }

  if (error || !candidate) {
    return <div className="container mx-auto py-6">Error: {error || "Candidate not found"}</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{candidate.name}</h1>
          <p className="text-lg text-muted-foreground">Match Score: {candidate.score.toFixed(2)}%</p>
        </div>
        <div className="flex gap-2">
          {candidate.email && (
            <Button variant="outline" className="flex gap-2">
              <Mail className="h-4 w-4" />
              Contact
            </Button>
          )}
          {candidate.resume?.file_path && (
            <Button className="flex gap-2">
              <Download className="h-4 w-4" />
              Resume
            </Button>
          )}
        </div>
      </div>

      <CandidateTabs candidate={candidate} candidateId={id} />
    </div>
  )
}

