import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

const candidates = [
  {
    id: "1",
    name: "Sarah Johnson",
    position: "Senior Software Engineer",
    score: 92,
    date: "2 days ago",
    avatar: "/placeholder-user.jpg?height=40&width=40",
    initials: "SJ",
  },
  {
    id: "2",
    name: "Michael Chen",
    position: "Product Manager",
    score: 88,
    date: "3 days ago",
    avatar: "/placeholder-user.jpg?height=40&width=40",
    initials: "MC",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    position: "UX Designer",
    score: 85,
    date: "5 days ago",
    avatar: "/placeholder-user.jpg?height=40&width=40",
    initials: "ER",
  },
  {
    id: "4",
    name: "David Kim",
    position: "Data Scientist",
    score: 78,
    date: "1 week ago",
    avatar: "/placeholder-user.jpg?height=40&width=40",
    initials: "DK",
  },
]

export function RecentCandidates() {
  return (
    <div className="space-y-8">
      {candidates.map((candidate) => (
        <div key={candidate.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={candidate.avatar} alt={candidate.name} />
            <AvatarFallback>{candidate.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <h1 className="font-semibold">
              {candidate.name}
            </h1>
            <p className="text-sm text-muted-foreground">{candidate.position}</p>
          </div>
          <div className="ml-auto font-medium">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${candidate.score >= 85 ? "text-green-500" : "text-amber-500"}`}>
                {candidate.score}%
              </span>
              <span className="text-xs text-muted-foreground">{candidate.date}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

