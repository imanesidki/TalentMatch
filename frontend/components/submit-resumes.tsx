"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { ResumeUploader } from "./resume-uploader"
import LoaderOne from "./ui/loader-one"

export function SubmitResumes() {
  const [skillWeighting, setSkillWeighting] = useState([40])
  const [experienceWeighting, setExperienceWeighting] = useState([30])
  const [educationWeighting, setEducationWeighting] = useState([20])
  const [locationWeighting, setLocationWeighting] = useState([10])

  const [step, setStep] = useState(1)

  return (
    <div className="space-y-6">
        <Card>
          <CardHeader className="grid grid-cols-2">
            <div>
              <CardTitle className="text-xl">{step === 1 ?
              "Step 1 : Matching Algorithm Settings" : step === 2 ?
              "Step 2 : Upload Resumes" :
              "Step 3 : Parsing Resumes in progress"}
              </CardTitle>
              <CardDescription className="mt-2">{step === 1 ?
              "Adjust the weighting of the matching algorithm to prioritize certain criteria." : step === 2 ?
              "Upload candidate resumes to parse and match against the job description." :
              "Your resumes have been successfully submitted. The matching process is in progress."}
              </CardDescription>
            </div>

            <div className="flex justify-end">
              {step === 2 && (
                <Button className="px-10" variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>
              )}
              {step === 1 && (
                <Button className="px-10" onClick={() => setStep(step + 1)}>Next</Button>
              )} 
              {step === 3 && (
                <Button className="px-10" onClick={() => setStep(1)}>Start Over</Button>
              )}
            </div>
          </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
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
            </div>
          )}

          {step === 2 && (
            <div>
              <ResumeUploader setStep={setStep} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 py-10">
              <LoaderOne />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}