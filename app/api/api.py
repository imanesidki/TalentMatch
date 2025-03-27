from fastapi import APIRouter
from app.api.endpoints import jobs, auth, dashboard, s3_files

api_router = APIRouter()


api_router.include_router(s3_files.router)  # Include our router
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"]) 