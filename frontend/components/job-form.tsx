"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X } from "lucide-react"

// Mock job data for editing
const mockJobData = {
  title: "Senior Software Engineer",
  department: "Engineering",
  location: "San Francisco, CA",
  type: "Full-time",
  salary: "$120,000 - $150,000",
  description:
    "We're looking for a Senior Software Engineer to join our team and help build scalable web applications. The ideal candidate will have strong experience with JavaScript, TypeScript, React, and Node.js, and a passion for writing clean, maintainable code.",
  responsibilities: [
    "Design and implement new features for our web applications",
    "Write clean, maintainable, and well-tested code",
    "Collaborate with product managers, designers, and other engineers",
    "Review code and provide constructive feedback to peers",
    "Mentor junior engineers and help them grow",
    "Participate in technical design discussions and architecture decisions",
  ],
  requirements: [
    "5+ years of experience in software development",
    "Strong proficiency in JavaScript, TypeScript, React, and Node.js",
    "Experience with RESTful APIs and GraphQL",
    "Familiarity with AWS or other cloud platforms",
    "Knowledge of CI/CD pipelines and DevOps practices",
    "Bachelor's degree in Computer Science or related field, or equivalent experience",
  ],
  niceToHave: [
    "Experience with serverless architectures",
    "Knowledge of AWS Lambda and other AWS services",
    "Experience with microservices architecture",
    "Contributions to open-source projects",
  ],
  benefits: [
    "Competitive salary and equity package",
    "Health, dental, and vision insurance",
    "401(k) with company match",
    "Flexible work hours and remote work options",
    "Unlimited PTO policy",
    "Professional development budget",
    "Home office stipend",
  ],
  skills: ["JavaScript", "TypeScript", "React", "Node.js", "REST APIs", "GraphQL", "AWS", "CI/CD"],
}

interface JobFormProps {
  isEditing?: boolean
  jobId?: string
}

export function JobForm({ isEditing = false, jobId }: JobFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState(
    isEditing
      ? mockJobData
      : {
          title: "",
          department: "",
          location: "",
          type: "",
          salary: "",
          description: "",
          responsibilities: [""],
          requirements: [""],
          niceToHave: [""],
          benefits: [""],
          skills: [],
        },
  )

  const [newSkill, setNewSkill] = useState("")
  const [newListItem, setNewListItem] = useState({
    responsibilities: "",
    requirements: "",
    niceToHave: "",
    benefits: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill],
      })
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    })
  }

  const addListItem = (listName: "responsibilities" | "requirements" | "niceToHave" | "benefits") => {
    if (newListItem[listName]) {
      setFormData({
        ...formData,
        [listName]: [...formData[listName], newListItem[listName]],
      })
      setNewListItem({
        ...newListItem,
        [listName]: "",
      })
    }
  }

  const removeListItem = (listName: "responsibilities" | "requirements" | "niceToHave" | "benefits", index: number) => {
    setFormData({
      ...formData,
      [listName]: formData[listName].filter((_, i) => i !== index),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)

    // Redirect to the jobs page
    router.push("/jobs")
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="p-6">
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="skills">Skills & Benefits</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Job Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary Range</Label>
                <Input
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="e.g. $120,000 - $150,000"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="description" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a detailed job description..."
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Responsibilities</Label>
              <div className="space-y-2">
                {formData.responsibilities.map((responsibility, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={responsibility}
                      onChange={(e) => {
                        const newResponsibilities = [...formData.responsibilities]
                        newResponsibilities[index] = e.target.value
                        setFormData({
                          ...formData,
                          responsibilities: newResponsibilities,
                        })
                      }}
                      placeholder="Enter a responsibility..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeListItem("responsibilities", index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newListItem.responsibilities}
                  onChange={(e) =>
                    setNewListItem({
                      ...newListItem,
                      responsibilities: e.target.value,
                    })
                  }
                  placeholder="Add a new responsibility..."
                />
                <Button type="button" onClick={() => addListItem("responsibilities")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requirements" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Requirements</Label>
              <div className="space-y-2">
                {formData.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={requirement}
                      onChange={(e) => {
                        const newRequirements = [...formData.requirements]
                        newRequirements[index] = e.target.value
                        setFormData({
                          ...formData,
                          requirements: newRequirements,
                        })
                      }}
                      placeholder="Enter a requirement..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeListItem("requirements", index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newListItem.requirements}
                  onChange={(e) =>
                    setNewListItem({
                      ...newListItem,
                      requirements: e.target.value,
                    })
                  }
                  placeholder="Add a new requirement..."
                />
                <Button type="button" onClick={() => addListItem("requirements")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nice to Have</Label>
              <div className="space-y-2">
                {formData.niceToHave.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newNiceToHave = [...formData.niceToHave]
                        newNiceToHave[index] = e.target.value
                        setFormData({
                          ...formData,
                          niceToHave: newNiceToHave,
                        })
                      }}
                      placeholder="Enter a nice-to-have qualification..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeListItem("niceToHave", index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newListItem.niceToHave}
                  onChange={(e) =>
                    setNewListItem({
                      ...newListItem,
                      niceToHave: e.target.value,
                    })
                  }
                  placeholder="Add a nice-to-have qualification..."
                />
                <Button type="button" onClick={() => addListItem("niceToHave")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 rounded-full hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {skill}</span>
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a required skill..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                />
                <Button type="button" onClick={addSkill}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Benefits</Label>
              <div className="space-y-2">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => {
                        const newBenefits = [...formData.benefits]
                        newBenefits[index] = e.target.value
                        setFormData({
                          ...formData,
                          benefits: newBenefits,
                        })
                      }}
                      placeholder="Enter a benefit..."
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem("benefits", index)}>
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newListItem.benefits}
                  onChange={(e) =>
                    setNewListItem({
                      ...newListItem,
                      benefits: e.target.value,
                    })
                  }
                  placeholder="Add a new benefit..."
                />
                <Button type="button" onClick={() => addListItem("benefits")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/jobs")}>
            Cancel
          </Button>
          <Button type="submit">{isEditing ? "Update Job" : "Create Job"}</Button>
        </div>
      </CardContent>
    </form>
  )
}

