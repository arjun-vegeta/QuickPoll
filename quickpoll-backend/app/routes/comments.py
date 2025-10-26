from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from ..database import get_db
from ..schemas import CommentCreate, CommentResponse
from ..models import Comment, Poll, User
from ..auth import get_current_user
from ..services.realtime_service import broadcast_comment_update

router = APIRouter(prefix="/comments", tags=["comments"])

@router.post("/", response_model=CommentResponse)
async def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new comment (authenticated users can choose to post anonymously)"""
    try:
        # Check if poll exists
        poll = db.query(Poll).filter(Poll.id == comment.poll_id).first()
        if not poll:
            raise HTTPException(status_code=404, detail="Poll not found")
        
        # Determine username based on user choice
        if current_user and not comment.post_anonymously:
            username = current_user.username
            user_id = current_user.id
        else:
            username = "Anonymous User"
            user_id = None if not current_user else current_user.id
        
        # Create comment
        new_comment = Comment(
            poll_id=comment.poll_id,
            user_id=user_id,
            username=username,
            comment_text=comment.comment_text
        )
        
        db.add(new_comment)
        db.commit()
        db.refresh(new_comment)
        
        # Broadcast new comment via WebSocket
        await broadcast_comment_update(
            comment.poll_id,
            {
                "id": str(new_comment.id),
                "username": new_comment.username,
                "comment_text": new_comment.comment_text,
                "created_at": new_comment.created_at.isoformat(),
            }
        )
        
        return new_comment
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/poll/{poll_id}", response_model=List[CommentResponse])
def get_poll_comments(poll_id: UUID, db: Session = Depends(get_db)):
    """Get all comments for a poll"""
    comments = db.query(Comment).filter(
        Comment.poll_id == poll_id
    ).order_by(Comment.created_at.desc()).all()
    
    return comments

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a comment (only creator or poll owner can delete)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user is comment creator or poll owner
    poll = db.query(Poll).filter(Poll.id == comment.poll_id).first()
    if comment.user_id != current_user.id and poll.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}
