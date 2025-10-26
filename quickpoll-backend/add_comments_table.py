#!/usr/bin/env python
"""Script to add comments table to database"""

from sqlalchemy import text
from app.database import engine

print("Adding comments table...")

with engine.connect() as conn:
    try:
        # Create comments table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS comments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                username VARCHAR(100) NOT NULL,
                comment_text TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        """))
        
        # Create indexes
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_comments_poll ON comments(poll_id);
        """))
        
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at);
        """))
        
        conn.commit()
        print("✅ Comments table created successfully!")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("Note: If table already exists, this is normal.")
