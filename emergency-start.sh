#!/bin/bash

# Set text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

echo -e "${BLUE}===== EMERGENCY STARTUP SCRIPT =====${RESET}"
echo -e "${YELLOW}This script will try different ways to start the app${RESET}"
echo

# Make sure we're in the project root directory
cd "$(dirname "$0")"

# First, check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${RED}node_modules directory not found. Installing dependencies...${RESET}"
  npm install
fi

echo -e "${BLUE}Creating .env file if it doesn't exist...${RESET}"
# Create a basic .env file if it doesn't exist
if [ ! -f ".env" ]; then
  echo "# Supabase
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Feature Flags
VITE_USE_MOCK_DATA=true
VITE_DEBUG=true" > .env
  echo -e "${GREEN}Created .env file with default values${RESET}"
else
  echo -e "${GREEN}.env file already exists${RESET}"
fi

# Check if there's an index.html file
if [ ! -f "index.html" ]; then
  echo -e "${RED}index.html not found! Creating it...${RESET}"
  
  echo "<!DOCTYPE html>
<html lang=\"en\">
  <head>
    <meta charset=\"UTF-8\" />
    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <title>KitchenBuddy</title>
  </head>
  <body>
    <div id=\"root\"></div>
    <script type=\"module\" src=\"/src/main.tsx\"></script>
  </body>
</html>" > index.html
  
  echo -e "${GREEN}Created index.html${RESET}"
fi

echo -e "${BLUE}Starting app in mock mode for best compatibility...${RESET}"
echo -e "${YELLOW}This mode doesn't require a Supabase backend${RESET}"

# First try: Use npm to run the mock mode
echo -e "${GREEN}Attempt 1: Starting with npm run dev:mock...${RESET}"
PORT=8081 npm run dev:mock &
PID=$!

sleep 5

# Check if the process is still running
if kill -0 $PID 2>/dev/null; then
  echo -e "${GREEN}App started successfully on port 8081!${RESET}"
  echo -e "${BLUE}Access the app at: ${GREEN}http://localhost:8081${RESET}"
  
  # Keep running in foreground
  wait $PID
  exit 0
else
  echo -e "${RED}Failed to start with npm run dev:mock${RESET}"
fi

# Second try: Direct Vite command
echo -e "${GREEN}Attempt 2: Starting with direct vite command...${RESET}"
PORT=8081 ./node_modules/.bin/vite --config vite.dev-mock.config.ts &
PID=$!

sleep 5

# Check if the process is still running
if kill -0 $PID 2>/dev/null; then
  echo -e "${GREEN}App started successfully on port 8081!${RESET}"
  echo -e "${BLUE}Access the app at: ${GREEN}http://localhost:8081${RESET}"
  
  # Keep running in foreground
  wait $PID
  exit 0
else
  echo -e "${RED}Failed to start with direct vite command${RESET}"
fi

# Third try: Basic fallback for normal mode
echo -e "${GREEN}Attempt 3: Falling back to normal mode...${RESET}"
PORT=8081 npm run dev &
PID=$!

sleep 5

# Final check
if kill -0 $PID 2>/dev/null; then
  echo -e "${GREEN}App started successfully on port 8081!${RESET}"
  echo -e "${BLUE}Access the app at: ${GREEN}http://localhost:8081${RESET}"
  
  # Keep running in foreground
  wait $PID
  exit 0
else
  echo -e "${RED}All startup attempts failed.${RESET}"
  echo -e "${YELLOW}Possible issues:${RESET}"
  echo "1. Port 8081 is already in use"
  echo "2. Node.js or npm issues"
  echo "3. Dependency problems"
  echo
  echo -e "${BLUE}Try running these commands manually:${RESET}"
  echo "npm run dev:8081"
  echo "PORT=8081 npm run dev"
  exit 1
fi 