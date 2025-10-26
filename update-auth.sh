#!/bin/bash

echo "🔐 Adding Authentication to QuickPoll"
echo "======================================"
echo ""

# Update backend
echo "📦 Updating backend dependencies..."
cd quickpoll-backend

# Activate virtual environment
source venv/bin/activate

# Install new dependencies
pip install bcrypt==4.1.2 pydantic[email]==2.5.3

# Migrate database
echo ""
echo "🗄️  Migrating database..."
python migrate_db.py

echo ""
echo "✅ Backend updated successfully!"
echo ""

# Update frontend
cd ../quickpoll-frontend
echo "📦 Updating frontend dependencies..."
echo "(No new dependencies needed)"

echo ""
echo "✅ Frontend updated successfully!"
echo ""

echo "🎉 Authentication system added!"
echo ""
echo "Changes:"
echo "  ✓ User registration and login"
echo "  ✓ Only logged-in users can create polls"
echo "  ✓ Anyone can vote (no login required)"
echo "  ✓ JWT-like token authentication"
echo "  ✓ User info displayed in navbar"
echo ""
echo "Restart your backend server to apply changes:"
echo "  cd quickpoll-backend"
echo "  uvicorn app.main:app --reload --port 8000"
echo ""
