from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from ..database import get_db
from ..schemas import PollCreate, PollResponse, UserCreate, UserResponse
from ..services.poll_service import create_poll, get_poll, get_all_polls, delete_poll
from ..models import User

router = APIRouter(prefix="/polls", tags=["polls"])

@router.post("/", response_model=PollResponse)
def create_new_poll(poll: PollCreate, db: Session = Depends(get_db)):
    """Create a new poll"""
    try:
        # Check if user exists, if not create a default user
        user = db.query(User).filter(User.id == poll.creator_id).first()
        if not user:
            # Create a default user with this ID
            user = User(
                id=poll.creator_id,
                username=f"user_{str(poll.creator_id)[:8]}",
                email=f"user_{str(poll.creator_id)[:8]}@quickpoll.local"
            )
            db.add(user)
            db.commit()
        
        new_poll = create_poll(db, poll)
        return new_poll
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[PollResponse])
def list_polls(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all active polls"""
    polls = get_all_polls(db, skip, limit)
    return polls

@router.get("/{poll_id}", response_model=PollResponse)
def get_poll_by_id(poll_id: UUID, db: Session = Depends(get_db)):
    """Get a specific poll by ID"""
    poll = get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    return poll

@router.delete("/{poll_id}")
def delete_poll_by_id(poll_id: UUID, db: Session = Depends(get_db)):
    """Delete a poll"""
    success = delete_poll(db, poll_id)
    if not success:
        raise HTTPException(status_code=404, detail="Poll not found")
    return {"message": "Poll deleted successfully"}

# User endpoints
@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    new_user = User(username=user.username, email=user.email)
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists")
