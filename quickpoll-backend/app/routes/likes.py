from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from uuid import UUID
from ..database import get_db
from ..schemas import LikeCreate, LikeResponse
from ..models import PollLike, Poll
from ..services.realtime_service import broadcast_like_update

router = APIRouter(prefix="/likes", tags=["likes"])

@router.post("/", response_model=dict)
async def toggle_like(like: LikeCreate, db: Session = Depends(get_db)):
    """
    Toggle like on a poll
    If already liked, remove like. Otherwise, add like.
    """
    try:
        # Check if poll exists
        poll = db.query(Poll).filter(Poll.id == like.poll_id).first()
        if not poll:
            raise HTTPException(status_code=404, detail="Poll not found")
        
        # Check if user already liked
        existing_like = db.query(PollLike).filter(
            and_(PollLike.poll_id == like.poll_id, PollLike.user_id == like.user_id)
        ).first()
        
        if existing_like:
            # Remove like
            db.delete(existing_like)
            poll.total_likes = max(0, poll.total_likes - 1)
            db.commit()
            
            # Broadcast update
            await broadcast_like_update(like.poll_id, poll.total_likes)
            
            return {"liked": False, "total_likes": poll.total_likes}
        else:
            # Add like
            new_like = PollLike(
                poll_id=like.poll_id,
                user_id=like.user_id
            )
            db.add(new_like)
            poll.total_likes += 1
            db.commit()
            
            # Broadcast update
            await broadcast_like_update(like.poll_id, poll.total_likes)
            
            return {"liked": True, "total_likes": poll.total_likes}
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/poll/{poll_id}/user/{user_id}")
def check_user_like(poll_id: UUID, user_id: UUID, db: Session = Depends(get_db)):
    """Check if user has liked a poll"""
    like = db.query(PollLike).filter(
        and_(PollLike.poll_id == poll_id, PollLike.user_id == user_id)
    ).first()
    return {"liked": like is not None}
