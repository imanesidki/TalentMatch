import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { CandidateTabs } from "@/components/candidate-tabs"

export default async function CandidateDetailsPage({ params }: { params: { id: string } }) {
  // In a real app, we would fetch the candidate data based on the ID
  const candidateId = await params.id

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/candidates">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Candidate Profile</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Contact
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Resume
          </Button>
          <Button size="sm">Schedule Interview</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Sarah Johnson</CardTitle>
            <CardDescription>Senior Software Engineer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">sarah.johnson@example.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">(555) 123-4567</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Match Score</span>
                <span className="text-sm font-medium text-primary">92%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: "92%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <CandidateTabs candidateId={candidateId} />
        </div>
      </div>
    </div>
  )
}

