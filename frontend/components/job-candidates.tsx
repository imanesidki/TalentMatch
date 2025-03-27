import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import { useAppData } from "@/providers/app-data-provider"
import { useParams } from "next/navigation"

// Common skills for suggestions
const commonSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "REST",
  "SQL",
  "NoSQL",
  "Machine Learning",
  "Data Science",
  "UI/UX",
  "Product Management",
  "Agile",
]

// Types for our candidates from the API
type ApiCandidate = {
  candidate_id: number
  name: string
  email: string
  phone: string
  score: number
  summary: string
  skills: string[]
  experience: string
  education: string
  matching_skills: string[]
  missing_skills: string[]
  extra_skills: string[]
  created_at: string
  updated_at: string
}

// Default job ID (can be passed as prop later)
const DEFAULT_JOB_ID = 7; // Using job_id=7 as it worked in our test

export function JobCandidates({ jobId: propJobId }: { jobId?: number }) {
  const params = useParams();
  const urlJobId = params?.jobId ? parseInt(params.jobId as string, 10) : undefined;
  // Use URL jobId if available, otherwise use the prop jobId, or fall back to default
  const jobId = urlJobId || propJobId || DEFAULT_JOB_ID;
  
  const { getCandidatesByJob } = useAppData()
  const [candidates, setCandidates] = useState<ApiCandidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [skillInput, setSkillInput] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [matchScore, setMatchScore] = useState<number[]>([0]) // Default to 0 until we load candidates
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [sortOrder, setSortOrder] = useState<"match-desc" | "match-asc">("match-desc")

  useEffect(() => {
    const loadCandidates = async () => {
      setIsLoading(true)
      try {
        console.log(`Fetching candidates for job ID: ${jobId}`);
        const data = await getCandidatesByJob(jobId)
        console.log(`Received ${data.length} candidates:`, data);
        setCandidates(data)
        
        // Set the match score filter to the lowest candidate score (or 0 if no candidates)
        if (data.length > 0) {
          const lowestScore = Math.floor(Math.min(...data.map(c => c.score * 100)))
          setMatchScore([Math.max(0, lowestScore - 5)]) // Set slightly lower than the lowest to ensure all are shown
        }
      } catch (error) {
        console.error("Failed to load candidates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCandidates()
  }, [jobId, getCandidatesByJob])

  const filteredSuggestions = commonSkills
    .filter((skill) => skill.toLowerCase().includes(skillInput.toLowerCase()) && !selectedSkills.includes(skill))
    .slice(0, 5)

  const addSkill = (skill: string) => {
    if (skill.trim() && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill])
      setSkillInput("")
    }
    setShowSuggestions(false)
  }

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill))
  }

  // Filter and sort candidates based on selected skills and match score
  const filteredCandidates = candidates
    .filter((candidate) => {
      // Filter by match score (convert percentage to decimal)
      if ((candidate.score * 100) < matchScore[0]) return false;
      
      // Filter by skills if any are selected
      if (selectedSkills.length > 0) {
        return selectedSkills.every(skill => 
          candidate.skills.some(candidateSkill => 
            candidateSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by match score
      if (sortOrder === "match-desc") {
        return b.score - a.score;
      } else {
        return a.score - b.score;
      }
    });

  // Get readable date
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Extract the position/title from experience
  const getPosition = (experience: string) => {
    const match = experience.match(/as an? (.+?) at/i) || experience.match(/in (.+?) at/i);
    return match ? match[1] : "Professional";
  };

  // Get the lowest score from candidates (for filters)
  const getLowestScore = () => {
    if (candidates.length === 0) return 0;
    return Math.max(0, Math.floor(Math.min(...candidates.map(c => c.score * 100))) - 5); // Slightly lower than lowest
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search candidates by skills..."
              className="w-full pl-8"
              value={skillInput}
              onChange={(e) => {
                setSkillInput(e.target.value)
                setShowSuggestions(e.target.value.length > 0)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && skillInput.trim()) {
                  e.preventDefault()
                  addSkill(skillInput.trim())
                }
              }}
              onFocus={() => setShowSuggestions(skillInput.length > 0)}
              onBlur={() => {
                // Delay hiding suggestions to allow for clicks
                setTimeout(() => setShowSuggestions(false), 200)
              }}
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
                <ul className="py-1">
                  {filteredSuggestions.map((skill) => (
                    <li
                      key={skill}
                      className="cursor-pointer px-4 py-2 hover:bg-muted"
                      onMouseDown={() => addSkill(skill)}
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {selectedSkills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="ml-1 rounded-full hover:bg-muted">
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {skill}</span>
                  </button>
                </Badge>
              ))}
              {selectedSkills.length > 0 && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setSelectedSkills([])}>
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary text-white" variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle filters</span>
          </Button>
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as "match-desc" | "match-asc")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match-desc">Match Score (High to Low)</SelectItem>
              <SelectItem value="match-asc">Match Score (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-md border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Additional Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground"
              onClick={() => setShowFilters(false)}
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select job title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software-engineer">Software Engineer</SelectItem>
                  <SelectItem value="product-manager">Product Manager</SelectItem>
                  <SelectItem value="ux-designer">UX Designer</SelectItem>
                  <SelectItem value="data-scientist">Data Scientist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Experience Level</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Match Score</label>
                <span className="text-sm text-muted-foreground">{matchScore}%+</span>
              </div>
              <Slider 
                min={0} 
                max={100} 
                step={1} 
                value={matchScore} 
                onValueChange={setMatchScore} 
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setMatchScore([getLowestScore()])
              setSelectedSkills([])
            }}>
              Reset
            </Button>
            <Button size="sm">Apply Filters</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium">Loading candidates...</p>
        </div>
      ) : (
        <>
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.candidate_id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/placeholder-user.jpg?height=40&width=40`} alt={candidate.name} />
                    <AvatarFallback>
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <h3 className="font-semibold">
                          {candidate.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/10">
                          {Math.round(candidate.score * 100)}% Match
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getRelativeTime(candidate.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {getPosition(candidate.experience)} • {candidate.education.split(" from ")[1] || "Remote"} • {candidate.experience.match(/\d+/)?.[0] || "3"} years
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="font-normal">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 4 && (
                        <Badge variant="secondary" className="font-normal">
                          +{candidate.skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 sm:flex-col">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/candidates/${candidate.candidate_id}`}>View Profile</Link>
                    </Button>
                    <Button size="sm" className="w-full">
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium">No candidates match your filters</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : filteredCandidates.length < candidates.length && (
            <div className="flex justify-center">
              <Button variant="outline">Load More</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

