#!/usr/bin/env python
"""Script to create database tables"""

from app.database import Base, engine
from app.models import User, Poll, PollOption, Vote, PollLike

print("Creating database tables...")
Base.metadata.create_all(engine)
print("✅ Database tables created successfully!")
print("\nTables created:")
print("  - users")
print("  - polls")
print("  - poll_options")
print("  - votes")
print("  - poll_likes")
