"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileText, Upload, X } from "lucide-react"

export function ResumeUploader({ setStep }: { setStep: (step: number) => void }) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)

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
      setFiles([...files, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
  }

  const handleUpload = () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          setUploadComplete(true)
          return 100
        }
        return prev + 10
      })
    }, 500)
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
                <p className="text-sm text-muted-foreground">Click to browse files (PDF, DOCX, TXT)</p>
              </div>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                accept=".pdf,.docx,.txt"
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
              <h3 className="font-medium">Selected Files ({files.length})</h3>
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
                  <span>Uploading...</span>
                  <span>{progress}%</span>
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
