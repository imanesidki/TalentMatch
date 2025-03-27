import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText } from "lucide-react"
import { Candidate } from "@/types/candidate"

interface CandidateResumeProps {
  candidate: Candidate
}

export function CandidateResume({ candidate }: CandidateResumeProps) {
  // Extract the file name from the path if it exists
  const fileName = candidate.resume?.file_path 
    ? candidate.resume.file_path.split('/').pop() || 'resume.pdf'
    : 'No resume available'
  
  const hasResume = candidate.resume && candidate.resume.file_path

  const handleDownload = async () => {
    if (!hasResume || !candidate.resume?.file_path) return;
    
    try {
      // Get the file path to pass to the API
      const fileKey = candidate.resume.file_path;
      
      // Create a URL to the download endpoint with the file key
      const downloadUrl = `http://localhost:8000/api/s3/download/${encodeURIComponent(fileKey)}`;
      
      // Open the URL in a new tab or initiate download
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error("Error downloading resume:", error);
    }
  };

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
          {hasResume ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">{fileName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(candidate.resume!.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No resume available for this candidate</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

