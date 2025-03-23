import { ResumeUploader } from "@/components/resume-uploader"

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Resumes</h1>
        <p className="text-muted-foreground">Upload candidate resumes to parse and add to your talent pool.</p>
      </div>
      <ResumeUploader />
    </div>
  )
}

