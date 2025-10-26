from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class PollOptionCreate(BaseModel):
    option_text: str = Field(..., min_length=1, max_length=500)
    position: int

class PollOptionResponse(BaseModel):
    id: UUID
    option_text: str
    vote_count: int
    position: int
    
    class Config:
        from_attributes = True

class PollCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    options: List[PollOptionCreate] = Field(..., min_items=2)

class PollResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    created_at: datetime
    expires_at: Optional[datetime]
    is_active: bool
    total_votes: int
    total_likes: int
    options: List[PollOptionResponse]
    creator_id: UUID
    
    class Config:
        from_attributes = True

class VoteCreate(BaseModel):
    poll_id: UUID
    option_id: UUID
    user_id: UUID

class VoteResponse(BaseModel):
    id: UUID
    poll_id: UUID
    option_id: UUID
    user_id: UUID
    voted_at: datetime
    
    class Config:
        from_attributes = True

class LikeCreate(BaseModel):
    poll_id: UUID
    user_id: UUID

class LikeResponse(BaseModel):
    id: UUID
    poll_id: UUID
    user_id: UUID
    liked_at: datetime
    
    class Config:
        from_attributes = True

# Auth schemas
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
