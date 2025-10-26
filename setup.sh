#!/bin/bash

echo "🚀 QuickPoll Setup Script"
echo "========================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker Desktop from: https://docs.docker.com/desktop/install/mac-install/"
    echo ""
    exit 1
fi

echo "✅ Docker is installed"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and try again."
    echo ""
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Setup Backend
echo "📦 Setting up backend..."
cd quickpoll-backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -q -r requirements.txt

# Start PostgreSQL
echo "Starting PostgreSQL container..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Create database tables
echo "Creating database tables..."
python -c "from app.database import Base, engine; Base.metadata.create_all(engine)"

echo "✅ Backend setup complete!"
echo ""

# Setup Frontend
cd ../quickpoll-frontend
echo "📦 Setting up frontend..."

if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
else
    echo "✅ npm dependencies already installed"
fi

echo "✅ Frontend setup complete!"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "1. Start backend (in this terminal):"
echo "   cd quickpoll-backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --port 8000"
echo ""
echo "2. Start frontend (in a new terminal):"
echo "   cd quickpoll-frontend"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
