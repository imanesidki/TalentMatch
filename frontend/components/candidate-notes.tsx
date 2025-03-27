"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"

const notes = [
  {
    id: "1",
    user: {
      name: "John Doe",
      avatar: "/placeholder-user.jpg?height=40&width=40",
      initials: "JD",
    },
    content:
      "Excellent candidate with strong technical skills. Would be a great fit for the Senior Software Engineer role.",
    date: "2 days ago",
  },
  {
    id: "2",
    user: {
      name: "Jane Smith",
      avatar: "/placeholder-user.jpg?height=40&width=40",
      initials: "JS",
    },
    content:
      "Had a great initial phone screen. Very articulate about past projects and showed deep knowledge of React and Node.js.",
    date: "3 days ago",
  },
]

interface CandidateNotesProps {
  candidateId?: string
}

export function CandidateNotes({ candidateId }: CandidateNotesProps) {
  const [newNote, setNewNote] = useState("")

  // In a real app, we would use candidateId to fetch notes from the API
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 font-semibold">Add Note</h3>
          <div className="space-y-4">
            <Textarea
              placeholder="Add your notes about this candidate..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={note.user.avatar} alt={note.user.name} />
                  <AvatarFallback>{note.user.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{note.user.name}</h4>
                    <span className="text-xs text-muted-foreground">{note.date}</span>
                  </div>
                  <p className="mt-2 text-sm">{note.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

