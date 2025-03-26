from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.core.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_password_hash, verify_password
from app.crud.recruiter import authenticate_recruiter, create_recruiter, get_recruiter_by_email
from app.schemas.schemas import RecruiterCreate, RecruiterResponse, Token, LoginRequest
from app.core.auth import get_current_active_user, get_current_user
from app.models.models import Recruiter
from pydantic import BaseModel

router = APIRouter()

# Schema for updating profile
class ProfileUpdate(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: Optional[str] = None

# Schema for updating password
class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 compatible token login, get an access token for future requests."""
    # Authenticate user
    user = authenticate_recruiter(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login endpoint that accepts JSON."""
    # Authenticate user
    user = authenticate_recruiter(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=RecruiterResponse)
async def register(recruiter: RecruiterCreate, db: Session = Depends(get_db)):
    """Register a new recruiter."""
    # Check if email already exists
    db_user = get_recruiter_by_email(db, recruiter.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new recruiter
    return create_recruiter(db, recruiter)

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(current_user: Recruiter = Depends(get_current_active_user)):
    """Logout endpoint. 
    
    This doesn't do anything on the server side since we're using stateless JWT tokens,
    but it can be extended in the future for token revocation or blacklisting.
    """
    return {"detail": "Successfully logged out"}

@router.get("/me", response_model=RecruiterResponse)
async def get_current_user_profile(current_user: Recruiter = Depends(get_current_active_user)):
    """Get the current user's profile."""
    return current_user

@router.patch("/me", response_model=RecruiterResponse)
async def update_user_profile(
    profile_data: ProfileUpdate,
    current_user: Recruiter = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update the current user's profile."""
    # Check if email is being updated and if it's already in use
    if profile_data.email and profile_data.email != current_user.email:
        existing_user = get_recruiter_by_email(db, profile_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
    
    # Update user profile fields
    if profile_data.firstname is not None:
        current_user.firstname = profile_data.firstname
    
    if profile_data.lastname is not None:
        current_user.lastname = profile_data.lastname
    
    if profile_data.email is not None:
        current_user.email = profile_data.email
    
    # Save changes to database
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.patch("/me/password", status_code=status.HTTP_200_OK)
async def update_user_password(
    password_data: PasswordUpdate,
    current_user: Recruiter = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update the current user's password."""
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Check if new passwords match
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )
    
    # Update password
    current_user.password = get_password_hash(password_data.new_password)
    
    # Save changes to database
    db.commit()
    
    return {"detail": "Password updated successfully"}