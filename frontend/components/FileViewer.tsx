// FileViewer.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Trash } from "lucide-react"
import { toast } from "sonner"

// Get API URL from environment variable or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface FileViewerProps {
  refreshInterval?: number  // In milliseconds
}

export function FileViewer({ refreshInterval = 30000 }: FileViewerProps) {
  const [files, setFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/s3/files`)
      if (!response.ok) {
        throw new Error('Failed to fetch files')
      }
      const data = await response.json()
      setFiles(data)
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch files on component mount and periodically
  useEffect(() => {
    fetchFiles()
    
    // Set up periodic refresh
    const interval = setInterval(() => {
      fetchFiles()
    }, refreshInterval)
    
    // Clean up on unmount
    return () => clearInterval(interval)
  }, [refreshInterval])

  const downloadFile = async (fileKey: string) => {
    try {
      // Create a link element and trigger download
      const link = document.createElement('a')
      link.href = `${API_URL}/s3/download/${encodeURIComponent(fileKey)}`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Failed to download file')
    }
  }

  const deleteFile = async (fileKey: string) => {
    try {
      const response = await fetch(`${API_URL}/s3/delete/${encodeURIComponent(fileKey)}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete file')
      }
      
      // Refresh file list after deletion
      fetchFiles()
      toast.success('File deleted successfully')
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('Failed to delete file')
    }
  }

  const getFileName = (fileKey: string) => {
    // Extract just the filename from the full path
    return fileKey.split('/').pop() || fileKey
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Uploaded Files</span>
          <Button variant="outline" size="sm" onClick={fetchFiles} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No files found</p>
        ) : (
          <div className="space-y-4">
            {files.map((fileKey) => (
              <div
                key={fileKey}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <span className="font-medium">{getFileName(fileKey)}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => downloadFile(fileKey)}>
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteFile(fileKey)}>
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
