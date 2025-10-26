#!/bin/bash

echo "🚀 Starting QuickPoll Backend..."
echo ""

cd quickpoll-backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run ./setup.sh first"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if PostgreSQL is running
if ! docker ps | grep -q postgres; then
    echo "Starting PostgreSQL..."
    docker-compose up -d
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
fi

echo "✅ PostgreSQL is running"
echo ""
echo "Starting FastAPI server on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""

uvicorn app.main:app --reload --port 8000
