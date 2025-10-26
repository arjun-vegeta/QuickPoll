from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from uuid import UUID
from ..database import get_db
from ..schemas import VoteCreate, VoteResponse
from ..models import Vote, PollOption, Poll
from ..services.realtime_service import broadcast_vote_update

router = APIRouter(prefix="/votes", tags=["votes"])

@router.post("/", response_model=VoteResponse)
async def create_vote(vote: VoteCreate, db: Session = Depends(get_db)):
    """
    Create or update a vote (atomic operation)
    If user already voted, update their vote
    """
    try:
        # Check if poll and option exist
        poll = db.query(Poll).filter(Poll.id == vote.poll_id).first()
        if not poll:
            raise HTTPException(status_code=404, detail="Poll not found")
        
        option = db.query(PollOption).filter(
            and_(PollOption.id == vote.option_id, PollOption.poll_id == vote.poll_id)
        ).first()
        if not option:
            raise HTTPException(status_code=404, detail="Option not found")
        
        # Check if user already voted
        existing_vote = db.query(Vote).filter(
            and_(Vote.poll_id == vote.poll_id, Vote.user_id == vote.user_id)
        ).first()
        
        if existing_vote:
            # User is changing their vote
            if existing_vote.option_id == vote.option_id:
                # Same option, no change needed
                return existing_vote
            
            # Decrement old option count
            old_option = db.query(PollOption).filter(PollOption.id == existing_vote.option_id).first()
            if old_option:
                old_option.vote_count = max(0, old_option.vote_count - 1)
            
            # Update vote
            existing_vote.option_id = vote.option_id
            
            # Increment new option count
            option.vote_count += 1
            
            db.commit()
            db.refresh(existing_vote)
            
            # Broadcast updates for both options
            if old_option:
                await broadcast_vote_update(vote.poll_id, old_option.id, old_option.vote_count, poll.total_votes)
            await broadcast_vote_update(vote.poll_id, option.id, option.vote_count, poll.total_votes)
            
            return existing_vote
        else:
            # New vote
            new_vote = Vote(
                poll_id=vote.poll_id,
                option_id=vote.option_id,
                user_id=vote.user_id
            )
            db.add(new_vote)
            
            # Increment option count
            option.vote_count += 1
            
            # Increment poll total votes
            poll.total_votes += 1
            
            db.commit()
            db.refresh(new_vote)
            
            # Broadcast update
            await broadcast_vote_update(vote.poll_id, option.id, option.vote_count, poll.total_votes)
            
            return new_vote
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/poll/{poll_id}/user/{user_id}", response_model=VoteResponse | None)
def get_user_vote(poll_id: UUID, user_id: UUID, db: Session = Depends(get_db)):
    """Get user's vote for a specific poll"""
    vote = db.query(Vote).filter(
        and_(Vote.poll_id == poll_id, Vote.user_id == user_id)
    ).first()
    return vote
