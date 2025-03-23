import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const jobs = [
  {
    id: "1",
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    candidates: 24,
    status: "active",
    posted: "June 15, 2023",
  },
  {
    id: "2",
    title: "Product Manager",
    department: "Product",
    location: "New York, NY",
    type: "Full-time",
    candidates: 18,
    status: "active",
    posted: "June 10, 2023",
  },
  {
    id: "3",
    title: "UX Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    candidates: 12,
    status: "active",
    posted: "June 5, 2023",
  },
  {
    id: "4",
    title: "Data Scientist",
    department: "Data",
    location: "Boston, MA",
    type: "Full-time",
    candidates: 8,
    status: "active",
    posted: "June 1, 2023",
  },
]

export function JobPostings() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Candidates</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Posted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-medium">
              <Link href={`/jobs/${job.id}`} className="hover:underline">
                {job.title}
              </Link>
            </TableCell>
            <TableCell>{job.department}</TableCell>
            <TableCell>{job.location}</TableCell>
            <TableCell>{job.type}</TableCell>
            <TableCell>{job.candidates}</TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                {job.status}
              </Badge>
            </TableCell>
            <TableCell>{job.posted}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/jobs/${job.id}`}>View</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

