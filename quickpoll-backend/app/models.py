from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Text, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # Nullable for backward compatibility
    created_at = Column(DateTime, default=datetime.utcnow)
    
    polls = relationship("Poll", back_populates="creator")

class Poll(Base):
    __tablename__ = "polls"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(500), nullable=False)
    description = Column(Text)
    category = Column(String(50), default="General")  # New category field
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    total_votes = Column(Integer, default=0)
    total_likes = Column(Integer, default=0)
    total_comments = Column(Integer, default=0)  # New field for comment count
    
    creator = relationship("User", back_populates="polls")
    options = relationship("PollOption", back_populates="poll", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="poll", cascade="all, delete-orphan")
    likes = relationship("PollLike", back_populates="poll", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="poll", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_polls_active', 'is_active', postgresql_where=(is_active == True)),
        Index('idx_polls_created', 'created_at'),
        Index('idx_polls_category', 'category'),
    )

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    poll_id = Column(UUID(as_uuid=True), ForeignKey("polls.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    username = Column(String(100), nullable=False)
    comment_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    poll = relationship("Poll", back_populates="comments")
    
    __table_args__ = (
        Index('idx_comments_poll', 'poll_id'),
        Index('idx_comments_created', 'created_at'),
    )

class PollOption(Base):
    __tablename__ = "poll_options"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    poll_id = Column(UUID(as_uuid=True), ForeignKey("polls.id", ondelete="CASCADE"), nullable=False)
    option_text = Column(String(500), nullable=False)
    vote_count = Column(Integer, default=0)
    position = Column(Integer, nullable=False)
    
    poll = relationship("Poll", back_populates="options")
    votes = relationship("Vote", back_populates="option", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_poll_options_poll', 'poll_id'),
    )

class Vote(Base):
    __tablename__ = "votes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    poll_id = Column(UUID(as_uuid=True), ForeignKey("polls.id", ondelete="CASCADE"), nullable=False)
    option_id = Column(UUID(as_uuid=True), ForeignKey("poll_options.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    voted_at = Column(DateTime, default=datetime.utcnow)
    
    poll = relationship("Poll", back_populates="votes")
    option = relationship("PollOption", back_populates="votes")
    
    __table_args__ = (
        UniqueConstraint('poll_id', 'user_id', name='unique_vote_per_user'),
        Index('idx_votes_poll', 'poll_id'),
    )

class PollLike(Base):
    __tablename__ = "poll_likes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    poll_id = Column(UUID(as_uuid=True), ForeignKey("polls.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    liked_at = Column(DateTime, default=datetime.utcnow)
    
    poll = relationship("Poll", back_populates="likes")
    
    __table_args__ = (
        UniqueConstraint('poll_id', 'user_id', name='unique_like_per_user'),
        Index('idx_likes_poll', 'poll_id'),
    )
