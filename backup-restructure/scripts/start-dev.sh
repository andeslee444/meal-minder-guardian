#!/bin/bash

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  Meal Minder Guardian Development   ${NC}"
echo -e "${BLUE}======================================${NC}"

# First run the setup script to ensure environment is ready
if [ -f "scripts/setup-dev-environment.sh" ]; then
  echo -e "${BLUE}Running environment setup script...${NC}"
  bash scripts/setup-dev-environment.sh
else
  echo -e "${RED}Error: setup-dev-environment.sh not found. Please ensure it exists in the scripts directory.${NC}"
  exit 1
fi

# Function to check if Supabase is running
check_supabase_running() {
  supabase status > /dev/null 2>&1
  return $?
}

# Function to check if a port is in use
is_port_in_use() {
  lsof -i :$1 > /dev/null 2>&1
  return $?
}

# Function to find an available port
find_available_port() {
  local port=$1
  while is_port_in_use $port; do
    echo -e "${YELLOW}Port $port is in use, trying another one...${NC}"
    ((port++))
  done
  echo $port
}

# Function to clean up on exit
cleanup() {
  echo -e "${BLUE}\nCleaning up...${NC}"
  
  # Kill the DALL-E function service
  if [ ! -z "$FUNCTION_PID" ]; then
    echo -e "${YELLOW}Stopping DALL-E function service (PID: $FUNCTION_PID)...${NC}"
    kill $FUNCTION_PID 2>/dev/null || true
  fi
  
  # Kill the development server
  if [ ! -z "$DEV_SERVER_PID" ]; then
    echo -e "${YELLOW}Stopping development server (PID: $DEV_SERVER_PID)...${NC}"
    kill $DEV_SERVER_PID 2>/dev/null || true
  fi
  
  echo -e "${GREEN}All services stopped.${NC}"
  exit 0
}

# Register the cleanup function for SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Initial dev server port
DEV_PORT=$(find_available_port 3000)
echo -e "${BLUE}Using port $DEV_PORT for the development server${NC}"

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
  # Get key from .env file directly
  if [ -f ".env" ]; then
    # Extract OPENAI_API_KEY from .env file
    OPENAI_API_KEY=$(grep "^OPENAI_API_KEY=" .env | cut -d '=' -f2)
    
    # If not found, try VITE_ prefixed version
    if [ -z "$OPENAI_API_KEY" ]; then
      OPENAI_API_KEY=$(grep "^VITE_OPENAI_API_KEY=" .env | cut -d '=' -f2)
    fi
    
    if [ -z "$OPENAI_API_KEY" ]; then
      echo -e "${RED}Error: No OpenAI API key found in .env file.${NC}"
      exit 1
    else
      echo -e "${GREEN}Using OpenAI API key from .env file${NC}"
    fi
  else
    echo -e "${RED}Error: .env file not found. Please run setup script first.${NC}"
    exit 1
  fi
fi

# Start the DALL-E function in the background with retry logic
echo -e "${BLUE}Starting DALL-E function service...${NC}"
MAX_RETRIES=3
RETRY_COUNT=0
FUNCTION_STARTED=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$FUNCTION_STARTED" = false ]; do
  cd supabase
  OPENAI_API_KEY=$OPENAI_API_KEY supabase functions serve dalle-image-gen --no-verify-jwt &
  FUNCTION_PID=$!
  cd ..
  
  # Wait a moment for the function to start
  sleep 3
  
  # Check if the function is running
  if kill -0 $FUNCTION_PID 2>/dev/null; then
    echo -e "${GREEN}DALL-E function service started (PID: $FUNCTION_PID)${NC}"
    FUNCTION_STARTED=true
  else
    ((RETRY_COUNT++))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo -e "${YELLOW}Failed to start DALL-E function service, retrying ($RETRY_COUNT/$MAX_RETRIES)...${NC}"
      sleep 2
    else
      echo -e "${RED}Failed to start DALL-E function service after $MAX_RETRIES attempts.${NC}"
      echo -e "${YELLOW}Continuing without DALL-E function service...${NC}"
    fi
  fi
done

# Start the development server with retry logic
echo -e "${BLUE}Starting development server...${NC}"
MAX_RETRIES=3
RETRY_COUNT=0
DEV_SERVER_STARTED=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$DEV_SERVER_STARTED" = false ]; do
  npm run dev -- --port $DEV_PORT &
  DEV_SERVER_PID=$!
  
  # Wait a moment for the server to start
  sleep 5
  
  # Check if the server is running
  if kill -0 $DEV_SERVER_PID 2>/dev/null; then
    echo -e "${GREEN}Development server started (PID: $DEV_SERVER_PID)${NC}"
    DEV_SERVER_STARTED=true
  else
    ((RETRY_COUNT++))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo -e "${YELLOW}Failed to start development server, retrying ($RETRY_COUNT/$MAX_RETRIES)...${NC}"
      sleep 2
    else
      echo -e "${RED}Failed to start development server after $MAX_RETRIES attempts.${NC}"
      cleanup
      exit 1
    fi
  fi
done

# Print success message
if [ "$FUNCTION_STARTED" = true ] && [ "$DEV_SERVER_STARTED" = true ]; then
  echo -e "${BLUE}======================================${NC}"
  echo -e "${GREEN}All services are running!${NC}"
  echo -e "${BLUE}======================================${NC}"
  echo -e "Development server: ${GREEN}http://localhost:$DEV_PORT${NC}"
  echo -e "DALL-E function: ${GREEN}http://localhost:54321/functions/v1/dalle-image-gen${NC}"
  echo -e ""
  echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
  echo -e "${BLUE}======================================${NC}"
else
  echo -e "${YELLOW}Some services failed to start. Check the logs above.${NC}"
fi

# Keep the script running to hold the background processes
wait $DEV_SERVER_PID

# If we get here, the dev server exited, so clean up
cleanup 