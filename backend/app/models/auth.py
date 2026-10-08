from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class SignupRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")
    confirm_password: str = Field(..., description="Confirm password matching password")

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=1, description="Password")

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    user: UserResponse
