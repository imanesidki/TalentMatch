// ResumeUploader.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileText, Upload, X } from "lucide-react"
import { toast } from "sonner"

// When running in Docker, the browser can't resolve 'backend' hostname
// So we need to use 'localhost' for client-side requests
const isClient = typeof window !== 'undefined';
const API_URL = isClient 
  ? 'http://localhost:8000/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');

// Debug log to help diagnose issues
if (typeof window !== 'undefined') {
  console.log('Frontend API URL:', API_URL);
}

export function ResumeUploader({ 
  setStep, 
  jobId,
  weights 
}: { 
  setStep: (step: number) => void,
  jobId: string,
  weights: {
    skill: number,
    experience: number,
    education: number,
    location: number
  }
}) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)

  // Effect to handle navigation after upload completes
  useEffect(() => {
    if (uploadComplete) {
      setStep(3)
      setUploadComplete(false)
    }
  }, [uploadComplete, setStep])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const totalFiles = files.length + newFiles.length
      
      if (totalFiles > 6) {
        toast.error(`You can only upload up to 6 files at once. You currently have ${files.length} files selected.`)
        return
      }
      
      const renamedFiles = newFiles.map(file => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = file.name.split('.').pop();
        const newName = `resume_${timestamp}.${extension}`;
        return new File([file], newName, { type: file.type });
      });
      
      setFiles([...files, ...renamedFiles])
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    if (files.length > 6) {
      toast.error("You can only upload up to 6 files at once")
      return
    }

    setUploading(true)
    setProgress(0)
    
    try {
      // Create form data for all files
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      formData.append('job_id', jobId)
      formData.append('skill_weight', weights.skill.toString())
      formData.append('experience_weight', weights.experience.toString())
      formData.append('education_weight', weights.education.toString())
      formData.append('location_weight', weights.location.toString())
      
      // Debug log for file upload
      console.log(`Uploading ${files.length} files to ${API_URL}/s3/upload with job_id: ${jobId} and weights:`, weights);
      
      // Send all files to the backend
      const response = await fetch(`${API_URL}/s3/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies in the request
        headers: {
          // Don't set Content-Type header when using FormData
          // Browser will set it automatically with the correct boundary
        }
      })
      
      if (!response.ok) {
        // Get more detailed error information
        let errorDetail = response.statusText;
        try {
          const errorJson = await response.json();
          errorDetail = errorJson.detail || errorJson.message || errorDetail;
        } catch (e) {
          // If we can't parse JSON, just use the status text
        }
        console.error(`Upload failed with status ${response.status}: ${errorDetail}`);
        throw new Error(`Upload failed: ${errorDetail}`);
      }
      
      const result = await response.json()
      console.log('Upload result:', result);
      
      // Update progress to 100%
      setProgress(100)
      
      // Handle any errors from individual files
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((error: string) => {
          toast.error(error)
        })
        if (result.uploaded_files.length > 0) {
          toast.warning(`Successfully uploaded ${result.uploaded_files.length} of ${files.length} files`)
        }
      } else {
        toast.success(`Successfully uploaded ${result.uploaded_files.length} files`)
      }
      
      // Set upload complete
      setUploadComplete(true)
      
    } catch (error) {
      console.error('Error uploading files:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
      toast.error('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {!uploading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-6">
              <div className="flex flex-col items-center justify-center text-center">
                <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                <h3 className="font-medium">Select your resumes here</h3>
                <p className="text-sm text-muted-foreground">Click to browse files (PDF, DOCX, DOC) - Max 6 files</p>
              </div>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
              />
              <Button asChild>
                <label htmlFor="file-upload">Select Files</label>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {files.length > 0 && (
        <Card>  
          <CardContent className="p-6">
            <div className="flex justify-between gap-2 mb-4 items-center">
              <h3 className="font-medium">Selected Files ({files.length}/6)</h3>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setFiles([])} disabled={uploading}>
                  Clear All
                </Button>
                <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
                  {uploading ? "Uploading..." : "Upload and Parse"}
                </Button>
              </div>
            </div>

            {uploading && (
              <div className="my-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading {currentFileIndex + 1} of {files.length}: {files[currentFileIndex]?.name}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            <div className="space-y-4">
              {files.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFile(index)} disabled={uploading}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
