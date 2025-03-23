"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"

export function JobSettings() {
  const [skillWeighting, setSkillWeighting] = useState([40])
  const [experienceWeighting, setExperienceWeighting] = useState([30])
  const [educationWeighting, setEducationWeighting] = useState([20])
  const [locationWeighting, setLocationWeighting] = useState([10])

  const [newSkill, setNewSkill] = useState("")
  const [skills, setSkills] = useState([
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "REST APIs",
    "GraphQL",
    "AWS",
    "CI/CD",
  ])

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Matching Algorithm Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Skills Weighting</Label>
              <span className="text-sm font-medium">{skillWeighting}%</span>
            </div>
            <Slider value={skillWeighting} onValueChange={setSkillWeighting} max={100} step={5} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Experience Weighting</Label>
              <span className="text-sm font-medium">{experienceWeighting}%</span>
            </div>
            <Slider value={experienceWeighting} onValueChange={setExperienceWeighting} max={100} step={5} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Education Weighting</Label>
              <span className="text-sm font-medium">{educationWeighting}%</span>
            </div>
            <Slider value={educationWeighting} onValueChange={setEducationWeighting} max={100} step={5} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Location Weighting</Label>
              <span className="text-sm font-medium">{locationWeighting}%</span>
            </div>
            <Slider value={locationWeighting} onValueChange={setLocationWeighting} max={100} step={5} />
          </div>

          <div className="pt-2 text-sm text-muted-foreground">
            Total: {skillWeighting[0] + experienceWeighting[0] + educationWeighting[0] + locationWeighting[0]}% (should
            equal 100%)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Required Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                {skill}
                <button onClick={() => removeSkill(skill)} className="ml-1 rounded-full hover:bg-muted">
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {skill}</span>
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addSkill()
                }
              }}
            />
            <Button onClick={addSkill}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-match">Automatic Matching</Label>
              <p className="text-sm text-muted-foreground">Automatically match new candidates to this job</p>
            </div>
            <Switch id="auto-match" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-match">Match Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications for new high-quality matches</p>
            </div>
            <Switch id="notify-match" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ai-summary">AI Resume Summarization</Label>
              <p className="text-sm text-muted-foreground">Use AI to generate summaries of candidate resumes</p>
            </div>
            <Switch id="ai-summary" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

