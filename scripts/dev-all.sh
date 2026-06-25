#!/bin/bash
# Start backend and frontend services in parallel for local development

set -e

# Catch exit signal to kill background processes gracefully
trap 'kill $(jobs -p) 2>/dev/null || true' EXIT

echo "Starting UsagePay Development Servers..."

# Start backend
echo "Booting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Start frontend
echo "Booting frontend client..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "========================================="
echo "Backend endpoint: http://localhost:5000"
echo "Frontend endpoint: http://localhost:5173"
echo "Press Ctrl+C to terminate all servers."
echo "========================================="

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
