#!/bin/bash

echo "🚀 Starting QuickPoll Frontend..."
echo ""

cd quickpoll-frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found!"
    echo "Please run ./setup.sh first"
    exit 1
fi

echo "Starting Next.js development server on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""

npm run dev
