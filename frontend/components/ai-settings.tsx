"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AISettings() {
  const [matchThreshold, setMatchThreshold] = useState([70])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Matching Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Match Threshold</Label>
              <span className="text-sm font-medium">{matchThreshold}%</span>
            </div>
            <Slider value={matchThreshold} onValueChange={setMatchThreshold} max={100} step={5} />
            <p className="text-xs text-muted-foreground">
              Only show candidates with a match score above this threshold
            </p>
          </div>

          <div className="space-y-2">
            <Label>AI Model</Label>
            <Select defaultValue="gpt-4">
              <SelectTrigger>
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                <SelectItem value="gpt-3.5">GPT-3.5 (Faster)</SelectItem>
                <SelectItem value="custom">Custom Model</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Select the AI model used for resume parsing and matching</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">AI Features</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="resume-parsing">Resume Parsing</Label>
                <p className="text-sm text-muted-foreground">Extract information from resumes automatically</p>
              </div>
              <Switch id="resume-parsing" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="skill-matching">Skill Matching</Label>
                <p className="text-sm text-muted-foreground">Match candidate skills to job requirements</p>
              </div>
              <Switch id="skill-matching" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="resume-summary">Resume Summarization</Label>
                <p className="text-sm text-muted-foreground">Generate concise summaries of candidate resumes</p>
              </div>
              <Switch id="resume-summary" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="candidate-ranking">Candidate Ranking</Label>
                <p className="text-sm text-muted-foreground">Automatically rank candidates based on match score</p>
              </div>
              <Switch id="candidate-ranking" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resume Parsing Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Information to Extract</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="extract-contact">Contact Information</Label>
                <p className="text-sm text-muted-foreground">Name, email, phone, location</p>
              </div>
              <Switch id="extract-contact" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="extract-experience">Work Experience</Label>
                <p className="text-sm text-muted-foreground">Job titles, companies, dates, responsibilities</p>
              </div>
              <Switch id="extract-experience" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="extract-education">Education</Label>
                <p className="text-sm text-muted-foreground">Degrees, institutions, dates</p>
              </div>
              <Switch id="extract-education" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="extract-skills">Skills</Label>
                <p className="text-sm text-muted-foreground">Technical skills, soft skills, certifications</p>
              </div>
              <Switch id="extract-skills" defaultChecked />
            </div>
          </div>

          <div className="pt-2">
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

