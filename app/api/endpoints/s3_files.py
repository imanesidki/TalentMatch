# app/api/endpoints/s3_files.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from typing import List

from app.services.s3_service import S3Service
import os

router = APIRouter(prefix="/s3", tags=["files"])

# Dependency to get S3 service
def get_s3_service():
    return S3Service()

@router.post("/upload", status_code=201)
async def upload_files(
    files: List[UploadFile] = File(...),
    job_id: int = Form(...),
    skill_weight: float = Form(...),
    experience_weight: float = Form(...),
    education_weight: float = Form(...),
    location_weight: float = Form(...),
    s3_service: S3Service = Depends(get_s3_service)
):
    """Upload multiple files to S3"""
    uploaded_files = []
    errors = []
    
    for file in files:
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
            errors.append(f"Invalid file type for {file.filename}: Only PDF and Word documents are allowed")
            continue
        
        try:
            # Upload to S3
            s3_key = s3_service.upload_file(file)
            uploaded_files.append({
                "filename": file.filename,
                "s3_key": s3_key
            })
        except Exception as e:
            errors.append(f"Failed to upload {file.filename}: {str(e)}")
    
    if not uploaded_files and errors:
        raise HTTPException(status_code=400, detail={"errors": errors})
    
    return {
        "uploaded_files": uploaded_files,
        "job_id": job_id,
        "weights": {
            "skill": skill_weight,
            "experience": experience_weight,
            "education": education_weight,
            "location": location_weight
        },
        "message": f"Successfully uploaded {len(uploaded_files)} files",
        "errors": errors if errors else None
    }

@router.get("/files", response_model=List[str])
async def list_files(s3_service: S3Service = Depends(get_s3_service)):
    """List all files in S3 bucket"""
    files = s3_service.list_files()
    return files

@router.get("/download/{file_key:path}")
async def download_file(
    file_key: str,
    s3_service: S3Service = Depends(get_s3_service)
):
    """Download a file from S3"""
    try:
        # Download from S3
        temp_file_path, filename = s3_service.download_file(file_key)
        
        # Return file response (will be deleted after response is sent)
        return FileResponse(
            path=temp_file_path,
            filename=filename,
            media_type="application/octet-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{file_key:path}")
async def delete_file(
    file_key: str,
    s3_service: S3Service = Depends(get_s3_service)
):
    """Delete a file from S3"""
    success = s3_service.delete_file(file_key)
    return {"message": "File deleted successfully"}