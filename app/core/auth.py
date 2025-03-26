from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from app.db.database import get_db
from app.core.security import decode_token
from app.models.models import Recruiter
from app.crud.recruiter import get_recruiter_by_email

# OAuth2 password bearer scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get the current authenticated user from the JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode the token
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    # Get email from token
    email = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    # Get user from database
    user = get_recruiter_by_email(db, email)
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(current_user: Recruiter = Depends(get_current_user)):
    """Check if the current user is active."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user 