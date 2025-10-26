from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from ..database import get_db
from ..schemas import PollCreate, PollResponse
from ..services.poll_service import create_poll, get_poll, get_all_polls, delete_poll
from ..models import User, Poll as PollModel
from ..auth import require_auth

router = APIRouter(prefix="/polls", tags=["polls"])

@router.post("/", response_model=PollResponse)
def create_new_poll(
    poll: PollCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Create a new poll (requires authentication)"""
    try:
        # Create poll with authenticated user as creator
        new_poll = PollModel(
            creator_id=current_user.id,
            title=poll.title,
            description=poll.description
        )
        db.add(new_poll)
        db.flush()
        
        # Add options
        from ..models import PollOption
        for option_data in poll.options:
            option = PollOption(
                poll_id=new_poll.id,
                option_text=option_data.option_text,
                position=option_data.position
            )
            db.add(option)
        
        db.commit()
        db.refresh(new_poll)
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
def delete_poll_by_id(
    poll_id: UUID, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """Delete a poll (only creator can delete)"""
    poll = get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    if poll.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this poll")
    
    success = delete_poll(db, poll_id)
    if not success:
        raise HTTPException(status_code=404, detail="Poll not found")
    return {"message": "Poll deleted successfully"}
