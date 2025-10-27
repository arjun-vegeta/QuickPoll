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
            description=poll.description,
            category=poll.category
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
def list_polls(
    skip: int = 0, 
    limit: int = 100, 
    sort_by: str = "created_at",  # created_at, votes, likes, comments
    category: str = None,
    search: str = None,
    db: Session = Depends(get_db)
):
    """Get all active polls with sorting, filtering, and search"""
    query = db.query(PollModel).filter(PollModel.is_active == True)
    
    # Filter by category
    if category and category != "All":
        query = query.filter(PollModel.category == category)
    
    # Search by title
    if search:
        query = query.filter(PollModel.title.ilike(f"%{search}%"))
    
    # Sort
    if sort_by == "votes":
        query = query.order_by(PollModel.total_votes.desc())
    elif sort_by == "likes":
        query = query.order_by(PollModel.total_likes.desc())
    elif sort_by == "comments":
        query = query.order_by(PollModel.total_comments.desc())
    else:  # created_at (default)
        query = query.order_by(PollModel.created_at.desc())
    
    polls = query.offset(skip).limit(limit).all()
    return polls

@router.get("/categories", response_model=List[str])
def get_categories():
    """Get list of available poll categories"""
    return [
        "Technology",
        "Sports",
        "Entertainment",
        "Politics",
        "Business",
        "Science",
        "Lifestyle",
        "General"
    ]

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
