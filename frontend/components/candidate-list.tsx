import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const candidates = [
  {
    id: "1",
    name: "Sarah Johnson",
    position: "Senior Software Engineer",
    location: "San Francisco, CA",
    experience: "8 years",
    skills: ["JavaScript", "React", "Node.js", "TypeScript", "GraphQL"],
    score: 92,
    date: "2 days ago",
    avatar: "/placeholder-user.jpg?height=40&width=40",
    initials: "SJ",
  },
  {
    id: "2",
    name: "Michael Chen",
    position: "Product Manager",
    location: "New York, NY",
    experience: "6 years",
    skills: ["Product Strategy", "User Research", "Agile", "Roadmapping"],
    score: 88,
    date: "3 days ago",
    avatar: "/placeholder-user.jpg?height=40&width=40",
    initials: "MC",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    position: "UX Designer",
    location: "Remote",
    experience: "5 years",
    skills: ["UI Design", "User Research", "Figma", "Prototyping"],
    score: 85,
    date: "5 days ago",
    avatar: "/placeholder-user.jpg?height=40&width=40",
    initials: "ER",
  },
  {
    id: "4",
    name: "David Kim",
    position: "Data Scientist",
    location: "Boston, MA",
    experience: "4 years",
    skills: ["Python", "Machine Learning", "SQL", "Data Visualization"],
    score: 78,
    date: "1 week ago",
    avatar: "/placeholder-user.jpg?height=40&width=40",
    initials: "DK",
  },
  {
    id: "5",
    name: "Jessica Martinez",
    position: "Frontend Developer",
    location: "Chicago, IL",
    experience: "3 years",
    skills: ["HTML", "CSS", "JavaScript", "React", "Tailwind"],
    score: 75,
    date: "1 week ago",
    avatar: "/placeholder-user.jpg?height=40&width=40",
    initials: "JM",
  },
]

export function CandidateList() {
  return (
    <div className="space-y-4">
      {candidates.map((candidate) => (
        <Card key={candidate.id}>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Avatar className="h-12 w-12">
                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                <AvatarFallback>{candidate.initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <h3 className="font-semibold">
                    <Link href={`/candidates/${candidate.id}`} className="hover:underline">
                      {candidate.name}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/10">
                      {candidate.score.toFixed(2)}% Match
                    </Badge>
                    <span className="text-xs text-muted-foreground">{candidate.date}</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  {candidate.position} • {candidate.location} • {candidate.experience}
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="font-normal">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button size="sm" className="w-full sm:w-auto" asChild>
                  <Link href={`/candidates/${candidate.id}`}>View Profile</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-center">
        <Button variant="outline">Load More</Button>
      </div>
    </div>
  )
}

