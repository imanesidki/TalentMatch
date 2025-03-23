"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

export function CandidateSearch() {
  const [skillInput, setSkillInput] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [matchScore, setMatchScore] = useState([70])
  const [showSuggestions, setShowSuggestions] = useState(false)

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
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle filters</span>
          </Button>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match-desc">Match Score (High to Low)</SelectItem>
              <SelectItem value="match-asc">Match Score (Low to High)</SelectItem>
              <SelectItem value="date-desc">Date Added (Newest)</SelectItem>
              <SelectItem value="date-asc">Date Added (Oldest)</SelectItem>
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
              <Slider defaultValue={[70]} max={100} step={5} value={matchScore} onValueChange={setMatchScore} />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm">
              Reset
            </Button>
            <Button size="sm">Apply Filters</Button>
          </div>
        </div>
      )}
    </div>
  )
}

