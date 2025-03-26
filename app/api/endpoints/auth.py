from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.crud.recruiter import authenticate_recruiter, create_recruiter, get_recruiter_by_email
from app.schemas.schemas import RecruiterCreate, RecruiterResponse, Token, LoginRequest
from app.core.auth import get_current_active_user
from app.models.models import Recruiter

router = APIRouter()

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