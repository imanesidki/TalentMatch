# TalentMatch
## AI candidate screening app that helps recruiting teams in the short-listing process

### How to run the project?
Simply run the command `make` in your terminal and let the Makefile do the rest.


### Features

- Secure Authentication: Complete secure authentication flow for recruiters using JWT.

- Resume Parsing: Extract key details (skills, experience, education) from resumes.

- Resume Summarization: Provides a short, AI-generated summary for each candidate.

- Job Match Scoring: Score the matching of a submission with the job description.

- Recruiter Dashboard: Shows ranked candidates and allows filtering.

- Manual Review & Feedback: Recruiters can manually review and add their own scores to refine precision.

- Quick Skill Matching: Highlights missing or extra skills in a candidate's profile.

- Customizable AI Weighting: Allows recruiters to adjust how AI ranks experience, skills, and education.

- Keyword-Based Search: Allows recruiters to search resumes by specific skills or experience.

### Tech Stack

- Frontend: NextJS
- Backend: FastAPI (Python)
- Containerization: Docker
- Database: Postgresql
- Cloud Storage: AWS S3
- AI: Grok, llama3, langchain
