#!/bin/bash
# start-server.sh — starts the NestJS server with retry for Atlas TLS
cd "$(dirname "$0")"
export NODE_TLS_REJECT_UNAUTHORIZED=0

MAX_RETRIES=20
for i in $(seq 1 $MAX_RETRIES); do
  echo "Starting server (attempt $i/$MAX_RETRIES)..."
  node dist/main.js &
  SERVER_PID=$!
  sleep 45
  
  # Check if server is listening
  if lsof -ti:3000 > /dev/null 2>&1; then
    echo "✅ Server started on port 3000 (PID: $SERVER_PID)"
    wait $SERVER_PID
    exit 0
  fi
  
  # Server didn't start, kill and retry
  kill $SERVER_PID 2>/dev/null
  wait $SERVER_PID 2>/dev/null
  echo "  Failed, retrying in 3s..."
  sleep 3
done

echo "❌ Failed to start after $MAX_RETRIES attempts"
exit 1
