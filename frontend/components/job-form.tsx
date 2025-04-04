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
import { toast } from "sonner"
import { createJob, updateJob, Job } from "@/lib/api/jobs"

interface JobFormProps {
  isEditing?: boolean
  jobId?: string
  jobData?: Job
}

export function JobForm({ isEditing = false, jobId, jobData }: JobFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState(
    isEditing && jobData
      ? {
          title: jobData.title || "",
          department: jobData.department || "",
          location: jobData.location || "",
          type: jobData.type || "",
          salary: jobData.salary || "",
          description: jobData.description || "",
          responsibilities: jobData.responsibilities || [""],
          requirements: jobData.requirements || [""],
          niceToHave: jobData.nice_to_have || [""],
          benefits: jobData.benefits || [""],
          skills: jobData.skills || [],
        }
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
        }
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
      skills: formData.skills.filter((s: string) => s !== skill),
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
      [listName]: formData[listName].filter((_: string, i: number) => i !== index),
    })
  }

  const validateForm = () => {
    // Check required fields
    if (!formData.title.trim()) {
      toast.error("Job title is required")
      setActiveTab("basic")
      return false
    }
    if (!formData.type) {
      toast.error("Job type is required")
      setActiveTab("basic")
      return false
    }
    if (!formData.description.trim()) {
      toast.error("Job description is required")
      setActiveTab("description")
      return false
    }
    if (formData.skills.length === 0) {
      toast.error("At least one required skill is needed")
      setActiveTab("skills")
      return false
    }
    if (formData.responsibilities.length === 0) {
      toast.error("At least one responsibility is needed")
      setActiveTab("responsibilities")
      return false
    }
    if (formData.requirements.length === 0) {
      toast.error("At least one requirement is needed")
      setActiveTab("requirements")
      return false
    }
    if (formData.location.length === 0) {
      toast.error("Location is required")
      setActiveTab("location")
      return false
    }
    if (formData.department.length === 0) {
      toast.error("Department is required")
      setActiveTab("department")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      if (isEditing && jobId) {
        await updateJob(jobId, formData)
        toast.success("Job updated successfully")
      } else {
        await createJob(formData)
        toast.success("Job created successfully")
      }
      router.push("/jobs")
    } catch (error) {
      console.log("Error saving job:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save job")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="p-6">
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="skills">Skills & Benefits</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Job Title <span className="text-red-500">*</span>
              </Label>
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
                <Label htmlFor="type">
                  Job Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
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

              <div className="space-y-2">
                <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)} required>
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. San Francisco, CA"
                  required
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
              <Label htmlFor="description">
                Job Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a detailed job description..."
                className="min-h-[200px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Responsibilities <span className="text-red-500">*</span></Label>
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
                      required
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
              <Label>Requirements <span className="text-red-500">*</span></Label>
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
                      required
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
              <Label>
                Required Skills <span className="text-red-500">*</span>
              </Label>
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
              {formData.skills.length === 0 && (
                <p className="text-sm text-red-500">At least one required skill is needed</p>
              )}
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
          <Button type="button" variant="outline" onClick={() => router.push("/jobs")} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Job" : "Create Job"}
          </Button>
        </div>
      </CardContent>
    </form>
  )
}

