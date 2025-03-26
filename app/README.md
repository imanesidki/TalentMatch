# TalentMatch Backend

This directory contains the FastAPI backend for the TalentMatch application with a PostgreSQL database.

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed

### Running the Application

1. Start the application with Docker Compose:
   ```bash
   docker-compose up
   ```

2. The API will be available at `http://localhost:8000`
3. API Documentation can be found at:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### Database Schema

The database schema includes the following models:

- **Job**: Represents a job posting with details like title, description, requirements, etc.
- **Candidate**: Represents a candidate with basic information like name, email, and phone.
- **Resume**: Contains candidate resume information including skills, experience, and education.
- **Score**: Relates resumes to jobs with matching metrics.
- **Recruiter**: Represents users of the application.
- **Note**: Allows recruiters to leave notes on candidates' resumes.

### Database Migrations

To run database migrations:

```bash
docker-compose exec backend alembic revision --autogenerate -m "Description of changes"
docker-compose exec backend alembic upgrade head
```

## Development

### Initial Project Structure

- `app/models/`: Database models
- `app/db/`: Database connection setup
- `app/alembic/`: Database migration scripts 