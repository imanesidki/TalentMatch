"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useAppData } from "@/providers/app-data-provider"
import { Skeleton } from "@/components/ui/skeleton"

export function RecentCandidates() {
  const { isLoading, recentCandidates } = useAppData()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, index) => (
          <div key={index} className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-4 space-y-1">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <div className="ml-auto">
              <Skeleton className="h-8 w-12 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // If no data, show a message
  if (recentCandidates.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">No recent candidates found</p>
      </div>
    )
  }

  // Get initials from candidate name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Format match score as percentage
  const formatScore = (score: number | null) => {
    if (score === null) return 'N/A'
    return `${Math.round(score * 100)}%`
  }

  // Generate a color based on score
  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-gray-200 text-gray-600'
    const scorePercent = score * 100
    if (scorePercent >= 80) return 'bg-green-100 text-green-700'
    if (scorePercent >= 60) return 'bg-blue-100 text-blue-700'
    if (scorePercent >= 40) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="space-y-4">
      {recentCandidates.map((candidate) => (
        <div key={candidate.id} className="flex items-center">
          <Avatar>
            <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{candidate.name}</p>
            <p className="text-xs text-muted-foreground">{candidate.job}</p>
          </div>
          <div className="ml-auto">
            <div className={`text-xs px-2 py-1 rounded ${getScoreColor(candidate.score)}`}>
              {formatScore(candidate.score)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

