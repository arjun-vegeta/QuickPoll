from sqlalchemy import create_engine, text
from app.database import DATABASE_URL

engine = create_engine(DATABASE_URL)

def add_category_column():
    """Add category and total_comments columns to polls table"""
    with engine.connect() as conn:
        try:
            # Add category column
            conn.execute(text("""
                ALTER TABLE polls 
                ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'General'
            """))
            
            # Add total_comments column
            conn.execute(text("""
                ALTER TABLE polls 
                ADD COLUMN IF NOT EXISTS total_comments INTEGER DEFAULT 0
            """))
            
            # Create index on category
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_polls_category ON polls(category)
            """))
            
            # Update total_comments for existing polls
            conn.execute(text("""
                UPDATE polls 
                SET total_comments = (
                    SELECT COUNT(*) 
                    FROM comments 
                    WHERE comments.poll_id = polls.id
                )
            """))
            
            conn.commit()
            print("✅ Successfully added category and total_comments columns!")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            conn.rollback()

if __name__ == "__main__":
    add_category_column()
