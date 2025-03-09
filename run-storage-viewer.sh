#!/bin/bash

# NCDU Storage Viewer launcher script
# Usage: ./run-storage-viewer.sh /path/to/ncdu-output.json

set -e

# Check if NCDU file path is provided
if [ $# -lt 1 ]; then
    echo "Error: Please provide the path to NCDU output JSON file"
    echo "Usage: $0 /path/to/ncdu-output.json"
    exit 1
fi

NCDU_FILE_PATH=$(realpath "$1")

# Check if the file exists
if [ ! -f "$NCDU_FILE_PATH" ]; then
    echo "Error: NCDU file not found at $NCDU_FILE_PATH"
    exit 1
fi

echo "Using NCDU data from: $NCDU_FILE_PATH"

# Environment variables
export PORT=3000
export NCDU_FILE_PATH="$NCDU_FILE_PATH"
export REFRESH_INTERVAL_HOURS=3
export VITE_API_BASE_URL="http://localhost:$PORT/api"

# Check if we're in the correct directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Check if the project is built
if [ ! -d "backend/dist" ] || [ ! -d "frontend/dist" ]; then
    echo "Project not built. Building now..."
    pnpm build
fi

# Function to clean up background processes on exit
cleanup() {
    echo "Shutting down services..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    exit 0
}

# Set up the trap to catch SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Start backend server
echo "Starting backend server on port $PORT..."
node backend/dist/index.js &
BACKEND_PID=$!

echo "Backend server PID: $BACKEND_PID"

# Check if frontend is built in production mode
if [ -d "frontend/dist" ]; then
    # Use a simple HTTP server to serve the frontend
    echo "Starting frontend server..."
    if command -v npx &> /dev/null; then
        cd frontend/dist
        npx http-server -p 5173 --cors &
        FRONTEND_PID=$!
        cd ../..
    else
        echo "Warning: npx not found. Please install Node.js or manually serve the frontend."
        echo "You can serve the frontend with: cd frontend/dist && npx http-server -p 5173"
    fi
    
    echo "Frontend available at: http://localhost:5173"
else
    echo "Frontend build not found. Please build the project first with: pnpm build"
    cleanup
    exit 1
fi

echo "NCDU Storage Viewer is running!"
echo "Press Ctrl+C to stop all services"

# Wait for backend to finish (which it won't, unless there's an error)
wait $BACKEND_PID