from typing import Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User
from backend.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str  # central-ministry, state-revenue, dro-cala, requiring-body, citizen, rehab-authority
    jurisdiction_scope: Optional[str] = "ALL"
    department: Optional[str] = None
    linked_parcel_id: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    jurisdiction_scope: str
    full_name: str
    email: str

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        full_name=req.full_name,
        role=req.role,
        jurisdiction_scope=req.jurisdiction_scope or "ALL",
        department=req.department,
        linked_parcel_id=req.linked_parcel_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({
        "sub": new_user.email,
        "role": new_user.role,
        "jurisdiction": new_user.jurisdiction_scope,
        "user_id": new_user.id
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": new_user.role,
        "jurisdiction_scope": new_user.jurisdiction_scope,
        "full_name": new_user.full_name,
        "email": new_user.email
    }

class LoginRequest(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: str

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    email_or_user = req.email or req.username
    if not email_or_user:
        raise HTTPException(status_code=400, detail="Email or username is required")
    
    user = db.query(User).filter(User.email == email_or_user).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({
        "sub": user.email,
        "role": user.role,
        "jurisdiction": user.jurisdiction_scope,
        "user_id": user.id
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "jurisdiction_scope": user.jurisdiction_scope,
        "full_name": user.full_name,
        "email": user.email
    }

@router.post("/token", response_model=TokenResponse)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({
        "sub": user.email,
        "role": user.role,
        "jurisdiction": user.jurisdiction_scope,
        "user_id": user.id
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "jurisdiction_scope": user.jurisdiction_scope,
        "full_name": user.full_name,
        "email": user.email
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "jurisdiction_scope": current_user.jurisdiction_scope,
        "department": current_user.department,
        "linked_parcel_id": current_user.linked_parcel_id
    }
