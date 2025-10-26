from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID
from ..models import Poll, PollOption, User
from ..schemas import PollCreate, PollResponse

def create_poll(db: Session, poll_data: PollCreate) -> Poll:
    """Create a new poll with options"""
    # Create poll
    poll = Poll(
        creator_id=poll_data.creator_id,
        title=poll_data.title,
        description=poll_data.description
    )
    db.add(poll)
    db.flush()  # Get poll.id before adding options
    
    # Create options
    for option_data in poll_data.options:
        option = PollOption(
            poll_id=poll.id,
            option_text=option_data.option_text,
            position=option_data.position
        )
        db.add(option)
    
    db.commit()
    db.refresh(poll)
    return poll

def get_poll(db: Session, poll_id: UUID) -> Optional[Poll]:
    """Get poll by ID with all options"""
    return db.query(Poll).filter(Poll.id == poll_id).first()

def get_all_polls(db: Session, skip: int = 0, limit: int = 100) -> List[Poll]:
    """Get all active polls"""
    return db.query(Poll).filter(Poll.is_active == True).order_by(Poll.created_at.desc()).offset(skip).limit(limit).all()

def delete_poll(db: Session, poll_id: UUID) -> bool:
    """Delete a poll"""
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if poll:
        db.delete(poll)
        db.commit()
        return True
    return False
