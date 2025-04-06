"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppData } from "@/providers/app-data-provider"

export function JobPostings() {
  const { isLoading, jobPostings } = useAppData()

  if (isLoading) {
    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Candidates</TableHead>
              <TableHead>Avg. Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(6).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // If no data, show a message
  if (jobPostings.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">No active job postings found</p>
      </div>
    )
  }

  // Format score as percentage
  const formatScore = (score: number | null) => {
    if (score === null) return 'N/A'
    return `${score.toFixed(2)}%`
  }

  // Get job type badge color
  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time':
        return 'bg-blue-100 text-blue-800'
      case 'part-time':
        return 'bg-purple-100 text-purple-800'
      case 'contract':
        return 'bg-amber-100 text-amber-800'
      case 'remote':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Posting Date</TableHead>
            <TableHead>Candidates</TableHead>
            <TableHead>Avg. Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobPostings.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getJobTypeColor(job.type)}>
                  {job.type}
                </Badge>
              </TableCell>
              <TableCell>{job.department}</TableCell>
              <TableCell>{job.location || 'Remote'}</TableCell>
              <TableCell>{job.created_at.split('T')[0].split('-').reverse().join('-')}</TableCell>
              <TableCell>{job.candidate_count}</TableCell>
              <TableCell>{formatScore(job.avg_score)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

