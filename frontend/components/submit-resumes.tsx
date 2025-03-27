"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { ResumeUploader } from "./resume-uploader"
import LoaderOne from "./ui/loader-one"

export function SubmitResumes({ jobId }: { jobId: string }) {
  const [skillWeighting, setSkillWeighting] = useState([40])
  const [experienceWeighting, setExperienceWeighting] = useState([30])
  const [educationWeighting, setEducationWeighting] = useState([20])
  const [locationWeighting, setLocationWeighting] = useState([10])

  const [step, setStep] = useState(1)

  const weights = {
    skill: skillWeighting[0],
    experience: experienceWeighting[0],
    education: educationWeighting[0],
    location: locationWeighting[0]
  }

  return (
    <div className="space-y-6">
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Matching Algorithm Settings</CardTitle>
            <CardDescription>
              Adjust the weights for different factors in the matching algorithm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Skills Weight</Label>
                <Slider
                  value={skillWeighting}
                  onValueChange={setSkillWeighting}
                  max={100}
                  step={1}
                />
                <div className="text-sm text-muted-foreground mt-2">
                  {skillWeighting[0]}%
                </div>
              </div>
              <div>
                <Label>Experience Weight</Label>
                <Slider
                  value={experienceWeighting}
                  onValueChange={setExperienceWeighting}
                  max={100}
                  step={1}
                />
                <div className="text-sm text-muted-foreground mt-2">
                  {experienceWeighting[0]}%
                </div>
              </div>
              <div>
                <Label>Education Weight</Label>
                <Slider
                  value={educationWeighting}
                  onValueChange={setEducationWeighting}
                  max={100}
                  step={1}
                />
                <div className="text-sm text-muted-foreground mt-2">
                  {educationWeighting[0]}%
                </div>
              </div>
              <div>
                <Label>Location Weight</Label>
                <Slider
                  value={locationWeighting}
                  onValueChange={setLocationWeighting}
                  max={100}
                  step={1}
                />
                <div className="text-sm text-muted-foreground mt-2">
                  {locationWeighting[0]}%
                </div>
              </div>
            </div>
            <Button onClick={() => setStep(2)}>Next</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <ResumeUploader 
          setStep={setStep} 
          jobId={jobId}
          weights={weights}
        />
      )}

      {step === 3 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <LoaderOne />
              <p className="text-center text-muted-foreground">
                Parsing resumes and calculating match scores...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}