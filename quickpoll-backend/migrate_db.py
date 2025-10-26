#!/usr/bin/env python
"""Script to add password_hash column to existing users table"""

from sqlalchemy import text
from app.database import engine

print("Adding password_hash column to users table...")

with engine.connect() as conn:
    try:
        # Add password_hash column if it doesn't exist
        conn.execute(text("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
        """))
        conn.commit()
        print("✅ Database migration completed successfully!")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("Note: If column already exists, this is normal.")
