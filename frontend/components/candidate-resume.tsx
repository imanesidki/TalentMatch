import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText } from "lucide-react"

export function CandidateResume() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Download Resume</CardTitle>
          <CardDescription>
            Download the candidate's resume to your device
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">sarah_johnson_resume.pdf</h3>
                <p className="text-sm text-muted-foreground">Uploaded 2 days ago</p>
              </div>
            </div>
            <Button size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

