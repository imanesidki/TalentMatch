# TalentMatch

## Overview

TalentMatch is a comprehensive candidate screening and matching system designed to help recruiters efficiently manage job postings and identify the most suitable candidates. The application uses AI-powered screening to match candidates to job descriptions based on skills, experience, and other qualifications.

## Key Features

- **Job Posting Management**: Create, edit, and manage job postings with detailed requirements
- **Resume Processing**: Upload and parse candidate resumes to extract key information
- **Candidate Matching**: Match candidates to jobs based on skills and qualifications
- **Skill Gap Analysis**: Identify matching, missing, and extra skills for each candidate
- **Recruiter Dashboard**: View analytics and manage the recruitment process

## Architecture

TalentMatch is a full-stack application with:

- **Backend**: Python FastAPI application
- **Frontend**: Next.js React application
- **Database**: SQL database with SQLAlchemy ORM
- **File Storage**: AWS S3 for resume storage
- **Authentication**: JWT-based authentication system
- **Containerization**: Docker for both frontend and backend services

## Documentation

For detailed documentation about the codebase, please refer to the [DOCUMENTATION.md](./DOCUMENTATION.md) file, which includes:

- Comprehensive API documentation
- Database model descriptions
- Authentication system details
- Frontend component overview
- Development setup instructions
- And more...

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL
- AWS S3 account (for file storage)
- Docker and Docker Compose (optional)

### Quick Start

1. Clone the repository
2. Set up the backend:
   ```bash
   cd app
   pip install -r requirements.txt
   ```
3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```
4. Configure environment variables (see DOCUMENTATION.md)
5. Start the development servers:
   - Backend: `uvicorn main:app --reload`
   - Frontend: `npm run dev`

## Project Structure

```
TalentMatch/
├── app/                    # Backend application
│   ├── alembic/            # Database migrations
│   ├── api/                # API endpoints
│   ├── core/               # Core functionality
│   ├── crud/               # Database operations
│   ├── db/                 # Database configuration
│   ├── models/             # Database models
│   ├── schemas/            # Pydantic schemas
│   └── services/           # External services
├── frontend/               # Frontend application
│   ├── app/                # Next.js app router
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── public/             # Static assets
└── docker-compose.yml      # Docker configuration
```

## Contributing

When contributing to this project, please follow these guidelines:

1. Understand the existing architecture and code patterns
2. Follow the established coding style and conventions
3. Write tests for new features
4. Update documentation for any changes
5. Use the detailed DOCUMENTATION.md as a reference

## License

This project is licensed under the MIT License - see the LICENSE file for details.
