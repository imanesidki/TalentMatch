# TalentMatch Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Key Features](#key-features)
4. [Technical Stack](#technical-stack)
5. [Setup Instructions](#setup-instructions)
   - [Prerequisites](#prerequisites)
   - [Environment Configuration](#environment-configuration)
   - [Running with Docker](#running-with-docker)

6. [Backend Documentation](#backend-documentation)
   - [API Structure](#api-structure)
   - [Database Models](#database-models)
   - [Authentication System](#authentication-system)
   - [File Storage](#file-storage)
7. [Frontend Documentation](#frontend-documentation)
   - [Application Structure](#application-structure)
   - [Key Components](#key-components)
   - [Authentication Flow](#authentication-flow)
8. [Matching Workflow](#matching-workflow)
9. [Development Workflow](#development-workflow)

## Project Overview

TalentMatch is an AI-powered candidate screening application designed to help recruiting teams in the short-listing selection process. The application addresses the challenge faced by tech companies that receive thousands of resumes for published job postings, making the review and filtering process time and resource-consuming.

The solution leverages generative AI to help the client's recruiting team efficiently process and evaluate job applications. It aims to be inclusive and as bias-free as possible, providing a streamlined approach to identifying the most suitable candidates for job openings.

## Architecture

TalentMatch follows a modern full-stack architecture:

- **Backend**: Python FastAPI application providing RESTful API endpoints
- **Frontend**: Next.js React application with server-side rendering
- **Database**: PostgreSQL with SQLAlchemy ORM
- **File Storage**: AWS S3 for resume storage
- **Authentication**: JWT-based authentication system
- **Containerization**: Docker for both frontend and backend services

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Frontend   │────▶│   Backend   │────▶│  Database   │
│  (Next.js)  │     │  (FastAPI)  │     │ (PostgreSQL)│
│             │     │             │     │             │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │             │
                    │  AWS S3     │
                    │ (File Store)│
                    │             │
                    └─────────────┘
```

## Key Features

### Core Features

- **Resume Parsing**: Extract key details (skills, experience, education) from resumes.
- **Job Match Scoring**: Score the matching of a submission with the job description.
- **Simple Recruiter Dashboard**: Shows ranked candidates and allows filtering.
- **Manual Review & Feedback**: Recruiters can manually review and add their own scores to refine precision.
- **Quick Skill Matching**: Highlights missing or extra skills in a candidate's profile.

### Additional Features

- **Resume Summarization**: Provides a short, AI-generated summary for each candidate.
- **Customizable AI Weighting**: Allows recruiters to adjust how AI ranks experience, skills, and education.
- **Keyword-Based Search**: Allows recruiters to search resumes by specific skills or experience.
- **Authentication**: Signin and signup for recruiters.

## Technical Stack

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Database Migrations**: Alembic
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: AWS S3

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui
- **State Management**: React Context API
- **Authentication**: JWT with HTTP-only cookies

### Infrastructure
- **Containerization**: Docker
- **Database**: PostgreSQL
- **Cloud Storage**: AWS S3

## Setup Instructions

### Prerequisites

- Docker and Docker Compose (for containerized setup)
- Python 3.8+ (for local backend development)
- Node.js 16+ (for local frontend development)
- PostgreSQL (for local database)
- AWS S3 account (for file storage)

### Environment Configuration

The project uses environment files for configuration:

1. `.env.backend` - Backend environment variables:
   ```
   # Database Configuration
   DATABASE_URL=postgresql://postgres:password@db:5432/talentmatch

   # JWT Authentication
   JWT_SECRET_KEY=your_secure_secret_key_here
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60

   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=gammachallenge
   GROQ_API_KEY=your_groq_api_key
   ```

2. `.env.frontend` - Frontend environment variables:
   ```
   # API Configuration
   NEXT_PUBLIC_API_URL=http://backend:8000/api
   ```

3. `.env.db` - Database environment variables:
   ```
   # PostgreSQL Configuration
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=password
   POSTGRES_DB=talentmatch
   ```

### Running with Docker

The easiest way to run the application is using Docker Compose:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd TalentMatch
   ```

2. Configure environment variables:
   - Update the `.env.backend`, `.env.frontend`, and `.env.db` files with your configuration
   - Ensure you have valid AWS credentials for S3 access

3. Start the application:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs


## Backend Documentation

### API Structure

The backend API is built with FastAPI and organized into logical modules:

- **Main Application** (`app/main.py`): Entry point that configures the FastAPI application
- **API Router** (`app/api/api.py`): Central router that includes all endpoint routers
- **Endpoint Modules**:
  - `app/api/endpoints/jobs.py`: Job posting management
  - `app/api/endpoints/auth.py`: Authentication and user management
  - `app/api/endpoints/dashboard.py`: Dashboard data and statistics
  - `app/api/endpoints/s3_files.py`: File upload and management
  - `app/api/endpoints/candidates.py`: Candidate management

#### Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jobs/` | GET | List all job postings with pagination |
| `/api/jobs/{job_id}` | GET | Get a specific job by ID |
| `/api/jobs/` | POST | Create a new job posting |
| `/api/jobs/{job_id}` | PUT | Update an existing job |
| `/api/jobs/{job_id}` | DELETE | Delete a job posting |
| `/api/auth/register` | POST | Register a new recruiter |
| `/api/auth/login` | POST | Login and get access token |
| `/api/auth/me` | GET | Get current user profile |
| `/api/s3/upload` | POST | Upload a file to S3 |
| `/api/s3/files` | GET | List all files in S3 bucket |
| `/api/candidates/` | GET | List all candidates |
| `/api/candidates/{candidate_id}` | GET | Get a specific candidate by ID |

### Database Models

The application uses SQLAlchemy ORM with the following key models:


![Image](/DataModel.jpeg "Optional title")

### Authentication System

The authentication system is implemented using JWT (JSON Web Tokens) with the following components:

- **Security Module** (`app/core/security.py`): Handles password hashing, token generation, and token verification
- **Auth Module** (`app/core/auth.py`): Provides dependencies for authenticating users in API endpoints
- **Auth Endpoints** (`app/api/endpoints/auth.py`): Handles user registration, login, and profile management

Key features:
- Password hashing with bcrypt
- JWT token generation with configurable expiration
- Token-based authentication for protected endpoints
- User registration with password validation

### File Storage

The application uses AWS S3 for file storage, particularly for storing candidate resumes. The implementation is in `app/services/s3_service.py`.

Key features:
- File upload to S3 bucket
- File download from S3
- Listing files in the S3 bucket
- File deletion from S3

## Frontend Documentation

### Application Structure

The frontend is built with Next.js and follows the App Router pattern. The structure is organized as follows:

- **Root Layout** (`frontend/app/layout.tsx`): Base layout with theme provider and toast notifications
- **Public Pages** (`frontend/app/page.tsx`): Landing page and public routes
- **Auth Pages** (`frontend/app/(auth)/`): Sign in and sign up pages
- **Protected Pages** (`frontend/app/(protected)/`): Dashboard and other authenticated pages
- **Components** (`frontend/components/`): Reusable UI components
- **UI Components** (`frontend/components/ui/`): Base UI components (buttons, cards, etc.)
- **Hooks** (`frontend/hooks/`): Custom React hooks
- **API Integration** (`frontend/lib/api/`): API client functions
- **Auth Utilities** (`frontend/lib/auth.ts`): Authentication utilities

### Key Components

#### Dashboard Components

- **Overview** (`frontend/components/overview.tsx`): Displays activity charts
- **RecentCandidates** (`frontend/components/recent-candidates.tsx`): Shows recently added candidates
- **JobPostings** (`frontend/components/job-postings.tsx`): Lists active job postings

#### Job Management Components

- **JobForm** (`frontend/components/job-form.tsx`): Form for creating and editing jobs
- **JobList** (`frontend/components/job-list.tsx`): Lists all jobs
- **JobDetails** (`frontend/components/job-details.tsx`): Displays detailed job information
- **DeleteJobButton** (`frontend/components/delete-job-button.tsx`): Handles job deletion

#### Candidate Management Components

- **CandidateProfile** (`frontend/components/candidate-profile.tsx`): Displays candidate information
- **CandidateSkillMatch** (`frontend/components/candidate-skill-match.tsx`): Shows skill matching analysis
- **CandidateResume** (`frontend/components/candidate-resume.tsx`): Displays resume content
- **CandidateNotes** (`frontend/components/candidate-notes.tsx`): Manages recruiter notes
- **ResumeUploader** (`frontend/components/resume-uploader.tsx`): Handles resume file uploads

#### Layout Components

- **DashboardHeader** (`frontend/components/dashboard-header.tsx`): Top navigation bar
- **DashboardSidebar** (`frontend/components/dashboard-sidebar.tsx`): Side navigation menu
- **ThemeProvider** (`frontend/components/theme-provider.tsx`): Manages light/dark theme
- **ThemeToggle** (`frontend/components/theme-toggle.tsx`): Theme toggle button

### Authentication Flow

The frontend authentication flow is implemented in `frontend/lib/auth.ts` and includes:

1. **User Registration**: Creates a new user account
2. **User Login**: Authenticates user and stores JWT token in cookies
3. **Token Management**: Stores and retrieves tokens from cookies
4. **Protected Routes**: Prevents unauthorized access to protected pages
5. **Profile Management**: Updates user profile and password

The `ProtectedRoute` component (`frontend/components/protected-route.tsx`) ensures that only authenticated users can access protected pages.

## Matching Workflow

The matching workflow is a core feature of TalentMatch that involves resume parsing and job matching. This process is designed to efficiently identify the most suitable candidates for job openings.


### Main Points:
- Automates recruitment by intelligently matching resumes to job descriptions.
- Reduces bias with anonymized data processing for fair evaluations.
- Delivers fast, accurate scoring using advanced AI and NLP.
**Key Features:**
-Extracts skills, education, and experience with precision.
-Calculates weighted match scores tailored to job needs.
-Scales effortlessly for single resumes or bulk processing.

**Technologies & Tools:**
Grok: Powers AI-driven insights.
LangChain: Manages LLM workflows.
SpaCy: Enhances resume parsing with robust NLP.

### Resume Parsing Process

1. **File Upload**: Resumes are uploaded through the frontend interface using the `ResumeUploader` component, which sends the files to the backend API.

2. **Storage**: The uploaded files are stored in AWS S3 using the `s3_service.py` module.

3. **Text Extraction**: The system extracts text from various document formats (PDF, DOCX, DOC) to prepare for parsing.

4. **Information Extraction**: Using natural language processing techniques, the system extracts key information from the resume:
   - Personal details (name, email, phone)
   - Skills (technical skills, soft skills)
   - Work experience (companies, roles, durations, responsibilities)
   - Education (degrees, institutions, graduation dates)
   - Projects and achievements

5. **Structured Data Creation**: The extracted information is structured into a standardized format and stored in the database using the `Resume` model.

### Job Matching Algorithm

1. **Skill Matching**: The system compares the candidate's skills with the job requirements:
   - **Matching Skills**: Skills that appear in both the resume and job description
   - **Missing Skills**: Skills required by the job but not found in the resume
   - **Extra Skills**: Skills in the resume that are not explicitly required by the job

2. **Experience Evaluation**: The system analyzes the candidate's work experience to determine relevance to the job position.

3. **Education Assessment**: The system evaluates the candidate's educational background against job requirements.

4. **Score Calculation**: A match score is calculated based on:
   - Percentage of matching skills
   - Relevance of experience
   - Educational qualifications
   - Additional factors (if configured)

5. **Score Storage**: The calculated scores and matching details are stored in the `Score` model, linking the resume to the job.

### Customizable Weighting

Recruiters can customize the importance of different factors in the matching algorithm:

1. **Skill Weighting**: Adjust the importance of skill matches in the overall score
2. **Experience Weighting**: Modify how much work experience impacts the score
3. **Education Weighting**: Change the significance of educational qualifications

This customization allows recruiters to tailor the matching process to specific job requirements and company priorities.

### Candidate Ranking and Filtering

1. **Dashboard Display**: Matched candidates are displayed on the recruiter dashboard, ranked by their match scores.

2. **Filtering Options**: Recruiters can filter candidates based on:
   - Match score threshold
   - Specific skills
   - Years of experience
   - Education level

3. **Detailed View**: Recruiters can view detailed candidate profiles, including:
   - Resume content
   - Skill match analysis (matching, missing, and extra skills)
   - Match score breakdown

4. **Manual Review**: Recruiters can add notes and manually adjust scores based on their review, which helps refine the matching algorithm over time.

This comprehensive matching workflow enables recruiters to efficiently process large volumes of applications and identify the most promising candidates for further consideration.



## Development Workflow


#### Docker Commands

- **Start All Services**:
  ```bash
  docker-compose up
  ```

- **Build and Start Services**:
  ```bash
  docker-compose up --build
  ```

- **Stop All Services**:
  ```bash
  docker-compose down
