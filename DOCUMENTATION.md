# TalentMatch Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend Documentation](#backend-documentation)
   - [API Structure](#api-structure)
   - [Database Models](#database-models)
   - [Authentication System](#authentication-system)
   - [File Storage](#file-storage)
4. [Frontend Documentation](#frontend-documentation)
   - [Application Structure](#application-structure)
   - [Authentication Flow](#authentication-flow)
   - [Key Components](#key-components)
   - [State Management](#state-management)
5. [Key Features](#key-features)
   - [Job Posting Management](#job-posting-management)
   - [Resume Processing](#resume-processing)
   - [Candidate Matching](#candidate-matching)
6. [Development Workflow](#development-workflow)
   - [Setup Instructions](#setup-instructions)
   - [Environment Variables](#environment-variables)
   - [Development Commands](#development-commands)

## Project Overview

TalentMatch is a comprehensive candidate screening and matching system designed to help recruiters efficiently manage job postings and identify the most suitable candidates. The application uses AI-powered screening to match candidates to job descriptions based on skills, experience, and other qualifications.

Key capabilities include:
- Job posting creation and management
- Resume parsing and analysis
- Candidate-job matching with scoring
- Skill gap analysis
- Recruiter dashboard with analytics

## Architecture

TalentMatch follows a modern full-stack architecture:

- **Backend**: Python FastAPI application providing RESTful API endpoints
- **Frontend**: Next.js React application with server-side rendering
- **Database**: SQL database (PostgreSQL) with SQLAlchemy ORM
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

## Backend Documentation

### API Structure

The backend API is built with FastAPI and organized into logical modules:

- **Main Application** (`app/main.py`): Entry point that configures the FastAPI application, middleware, and includes the API router
- **API Router** (`app/api/api.py`): Central router that includes all endpoint routers
- **Endpoint Modules**:
  - `app/api/endpoints/jobs.py`: Job posting management
  - `app/api/endpoints/auth.py`: Authentication and user management
  - `app/api/endpoints/dashboard.py`: Dashboard data and statistics
  - `app/api/endpoints/s3_files.py`: File upload and management

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jobs/` | GET | List all job postings with pagination |
| `/api/jobs/{job_id}` | GET | Get a specific job by ID |
| `/api/jobs/` | POST | Create a new job posting |
| `/api/jobs/{job_id}` | PUT | Update an existing job |
| `/api/jobs/{job_id}` | DELETE | Delete a job posting |
| `/api/auth/register` | POST | Register a new recruiter |
| `/api/auth/login` | POST | Login and get access token |
| `/api/auth/token` | POST | OAuth2 compatible token login |
| `/api/auth/me` | GET | Get current user profile |
| `/api/auth/me` | PATCH | Update user profile |
| `/api/auth/me/password` | PATCH | Update user password |
| `/api/auth/logout` | POST | Logout (token revocation) |
| `/api/s3/upload` | POST | Upload a file to S3 |
| `/api/s3/files` | GET | List all files in S3 bucket |
| `/api/s3/download/{file_key}` | GET | Download a file from S3 |
| `/api/s3/delete/{file_key}` | DELETE | Delete a file from S3 |

### Database Models

The application uses SQLAlchemy ORM with the following models defined in `app/models/models.py`:

#### Job

Represents a job posting with details about the position.

**Key fields**:
- `job_id`: Primary key
- `title`: Job title
- `department`: Department name
- `location`: Job location
- `type`: Job type (Full-time, Part-time, etc.)
- `salary`: Salary range
- `description`: Detailed job description
- `status`: Job status (active, closed)
- `responsibilities`: Array of job responsibilities
- `requirements`: Array of job requirements
- `nice_to_have`: Array of nice-to-have qualifications
- `benefits`: Array of job benefits
- `skills`: Array of required skills
- `created_by`: Foreign key to recruiter

**Relationships**:
- `resumes`: One-to-many relationship with Resume
- `scores`: One-to-many relationship with Score
- `recruiter`: Many-to-one relationship with Recruiter

#### Candidate

Represents a job candidate.

**Key fields**:
- `candidate_id`: Primary key
- `name`: Candidate name
- `email`: Candidate email
- `phone`: Candidate phone number

**Relationships**:
- `resume`: One-to-one relationship with Resume

#### Resume

Represents a candidate's resume with parsed information.

**Key fields**:
- `resume_id`: Primary key
- `candidate_id`: Foreign key to Candidate
- `job_id`: Foreign key to Job
- `summary`: Resume summary
- `skills`: Array of candidate skills
- `experience`: Experience details
- `education`: Education details
- `file_path`: Path to stored resume file

**Relationships**:
- `candidate`: One-to-one relationship with Candidate
- `job`: Many-to-one relationship with Job
- `scores`: One-to-many relationship with Score
- `notes`: One-to-many relationship with Note

#### Score

Represents a match score between a resume and a job.

**Key fields**:
- `id`: Primary key
- `job_id`: Foreign key to Job
- `resume_id`: Foreign key to Resume
- `score`: Match score value
- `matching_skills`: Array of matching skills
- `missing_skills`: Array of missing skills
- `extra_skills`: Array of extra skills

**Relationships**:
- `job`: Many-to-one relationship with Job
- `resume`: Many-to-one relationship with Resume

#### Recruiter

Represents a recruiter user.

**Key fields**:
- `id`: Primary key
- `firstname`: First name
- `lastname`: Last name
- `email`: Email address
- `password`: Hashed password
- `is_active`: Active status

**Relationships**:
- `notes`: One-to-many relationship with Note
- `jobs`: One-to-many relationship with Job

#### Note

Represents a recruiter's note on a candidate's resume.

**Key fields**:
- `id`: Primary key
- `recruiter_id`: Foreign key to Recruiter
- `resume_id`: Foreign key to Resume
- `text`: Note text

**Relationships**:
- `recruiter`: Many-to-one relationship with Recruiter
- `resume`: Many-to-one relationship with Resume

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
- Profile and password update functionality

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

### Authentication Flow

The frontend authentication flow is implemented in `frontend/lib/auth.ts` and includes:

1. **User Registration**: Creates a new user account
2. **User Login**: Authenticates user and stores JWT token in cookies
3. **Token Management**: Stores and retrieves tokens from cookies
4. **Protected Routes**: Prevents unauthorized access to protected pages
5. **Profile Management**: Updates user profile and password

The `ProtectedRoute` component (`frontend/components/protected-route.tsx`) ensures that only authenticated users can access protected pages.

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

### State Management

The application uses a combination of:

- **React Context**: For global state (theme, sidebar state)
- **React Hooks**: For component-level state
- **Custom Hooks**: For reusable logic
- **App Data Provider** (`frontend/providers/app-data-provider.tsx`): Provides global application data

## Key Features

### Job Posting Management

The job posting management feature allows recruiters to:

1. **Create Job Postings**: Define job details, requirements, and skills
2. **Edit Job Postings**: Update existing job information
3. **Delete Job Postings**: Remove jobs that are no longer active
4. **View Job Details**: See comprehensive job information
5. **List Jobs**: View all jobs with filtering and pagination

The implementation spans both backend (`app/api/endpoints/jobs.py`, `app/crud/job.py`) and frontend (`frontend/components/job-form.tsx`, `frontend/components/job-list.tsx`).

### Resume Processing

The resume processing feature handles:

1. **Resume Upload**: Uploading resume files to S3
2. **Resume Parsing**: Extracting information from resumes
3. **Candidate Creation**: Creating candidate profiles from resumes
4. **Resume Storage**: Storing and retrieving resume files

The implementation includes backend services (`app/services/s3_service.py`) and frontend components (`frontend/components/resume-uploader.tsx`).

### Candidate Matching

The candidate matching feature provides:

1. **Skill Matching**: Comparing candidate skills with job requirements
2. **Match Scoring**: Calculating a match score for each candidate
3. **Skill Gap Analysis**: Identifying missing and extra skills
4. **Candidate Ranking**: Ranking candidates by match score

The implementation includes backend logic for scoring and frontend components for displaying match results (`frontend/components/candidate-skill-match.tsx`).

## Development Workflow

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd TalentMatch
   ```

2. **Backend Setup**:
   ```bash
   cd app
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```

4. **Database Setup**:
   ```bash
   # In the app directory
   alembic upgrade head
   ```

5. **Start Development Servers**:
   - Backend:
     ```bash
     cd app
     uvicorn main:app --reload
     ```
   - Frontend:
     ```bash
     cd frontend
     npm run dev
     ```

### Environment Variables

#### Backend Environment Variables

Create a `.env` file in the `app` directory with the following variables:

```
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/talentmatch
```
- `DATABASE_URL`: PostgreSQL connection string in the format `postgresql://username:password@host:port/database_name`
  - Default: `postgresql://postgres:password@db:5432/talentmatch` (for Docker)
  - For local development: `postgresql://postgres:password@localhost:5432/talentmatch`

```
# JWT Authentication
JWT_SECRET_KEY=your_secure_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
- `JWT_SECRET_KEY`: Secret key used for JWT token generation and validation
  - Default: `gamma_secret_key` (should be changed in production)
  - Recommendation: Use a strong random string
- `JWT_ALGORITHM`: Algorithm used for JWT token generation
  - Default: `HS256`
  - Options: `HS256`, `HS384`, `HS512`
- `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT token expiration time in minutes
  - Default: `60` (1 hour)

```
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=gammachallenge
```
- `AWS_ACCESS_KEY_ID`: AWS access key for S3 bucket access
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for S3 bucket access
- `AWS_REGION`: AWS region where the S3 bucket is located
  - Default: `us-east-1`
- `S3_BUCKET_NAME`: Name of the S3 bucket for storing resumes
  - Default: `gammachallenge`

#### Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```
- `NEXT_PUBLIC_API_URL`: URL of the backend API
  - Default: `http://localhost:8000/api`
  - For production: Use your deployed API URL
  - Note: The `NEXT_PUBLIC_` prefix makes this variable available in the browser

#### Environment Variables in Docker

The project uses Docker Compose with environment files for each service:

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

These environment files are referenced in the `docker-compose.yml` file:

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    env_file:
      - .env.frontend

  backend:
    build: ./app
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    depends_on:
      - db
    env_file:
      - .env.backend
    command: uvicorn app.main:app --host 0.0.0.0 --reload

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    env_file:
      - .env.db
    ports:
      - "5432:5432"
```

The Docker environment setup ensures that:

1. The frontend service can communicate with the backend service using the internal Docker network hostname (`http://backend:8000/api`)
2. The backend service can connect to the database using the internal Docker network hostname (`postgresql://postgres:password@db:5432/talentmatch`)
3. All services have access to their required environment variables
4. Data persistence is maintained through the `postgres_data` volume

Frontend components that interact with the API (such as `FileViewer.tsx` and `resume-uploader.tsx`) use the environment variable to determine the API URL:

```typescript
// Get API URL from environment variable or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
```

This approach allows the application to work seamlessly in both development and production environments, as well as in Docker containers, without hardcoding API URLs.

This approach keeps sensitive information out of the Docker Compose file and makes it easier to manage environment-specific configurations.

### Development Commands

#### Backend Commands

- **Run Development Server**:
  ```bash
  uvicorn main:app --reload
  ```

- **Run Database Migrations**:
  ```bash
  alembic revision --autogenerate -m "migration message"
  alembic upgrade head
  ```

#### Frontend Commands

- **Run Development Server**:
  ```bash
  npm run dev
  ```

- **Build for Production**:
  ```bash
  npm run build
  ```

- **Start Production Server**:
  ```bash
  npm start
  ```

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
