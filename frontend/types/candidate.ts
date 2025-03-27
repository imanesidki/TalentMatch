// Define shared types for candidate data
export type Resume = {
  resume_id: number
  job_id: number
  summary?: string | null
  skills: string[]
  experience?: string | null
  education?: string | null
  file_path?: string | null
  created_at: string
  updated_at: string
}

export type Candidate = {
  candidate_id: number
  name: string
  email: string
  phone?: string | null
  score: number
  resume?: Resume | null
  summary?: string | null
  skills: string[]
  experience?: string | null
  education?: string | null
  matching_skills: string[]
  missing_skills: string[]
  extra_skills: string[]
  created_at: string
  updated_at: string
} 