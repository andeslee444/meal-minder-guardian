#!/bin/bash
set -e

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Meal Minder Guardian Setup Script  ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${YELLOW}No .env file found. Creating from .env.example...${NC}"
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${GREEN}Created .env file from .env.example${NC}"
  else
    echo -e "${RED}Error: .env.example file not found. Please create a .env file manually.${NC}"
    exit 1
  fi
fi

# Load environment variables from .env
echo -e "${BLUE}Loading environment variables...${NC}"
export $(grep -v '^#' .env | xargs)

# Check for required env variables
if [ -z "$VITE_OPENAI_API_KEY" ] || [ "$VITE_OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
  echo -e "${RED}Error: VITE_OPENAI_API_KEY is not set in .env file${NC}"
  echo -e "${YELLOW}Please edit the .env file to add your OpenAI API key${NC}"
  exit 1
fi

if [ -z "$VITE_SPOONACULAR_API_KEY" ] || [ "$VITE_SPOONACULAR_API_KEY" = "your_spoonacular_api_key_here" ]; then
  echo -e "${YELLOW}Warning: VITE_SPOONACULAR_API_KEY is not set in .env file. Fallback mock recipes will be used.${NC}"
fi

# Kill any running Supabase or Vite processes
echo -e "${BLUE}Cleaning up running processes...${NC}"
pkill -f "supabase" || true
pkill -f "vite" || true
pkill -f "function serve" || true
echo -e "${GREEN}Cleaned up processes${NC}"

# Wait a moment for processes to terminate
sleep 2

# Stop Supabase (in case it's running in the background)
echo -e "${BLUE}Stopping any running Supabase services...${NC}"
supabase stop || true
echo -e "${GREEN}Supabase stopped${NC}"

# Start Supabase
echo -e "${BLUE}Starting Supabase...${NC}"
supabase start
echo -e "${GREEN}Supabase started successfully${NC}"

# Create a local .env file for Supabase DALL-E function with the OpenAI API key
echo -e "${BLUE}Setting up environment for DALL-E function...${NC}"
mkdir -p supabase/functions/dalle-image-gen
cat > supabase/functions/dalle-image-gen/.env << EOL
OPENAI_API_KEY=$OPENAI_API_KEY
EOL
echo -e "${GREEN}Created .env file for DALL-E function${NC}"

# Ensure package.json has type module for postcss.config.js
if ! grep -q '"type": "module"' package.json; then
  echo -e "${YELLOW}Adding 'type: module' to package.json to fix MODULE_TYPELESS_PACKAGE_JSON warning${NC}"
  sed -i '' 's/"private": true,/"private": true,\n  "type": "module",/' package.json
  echo -e "${GREEN}Updated package.json${NC}"
fi

# Ensure tsconfig has proper path aliases
echo -e "${BLUE}Checking for proper path aliases in tsconfig.json...${NC}"
if [ -f "tsconfig.json" ]; then
  if ! grep -q '"@/\*": \["./src/\*"\]' tsconfig.json; then
    echo -e "${YELLOW}Updating path aliases in tsconfig.json...${NC}"
    # This is a simple check, but for robust implementation use jq or other proper JSON parser
    sed -i '' 's/"paths": {/"paths": {\n      "@\/*": ["\.\/src\/*"],/' tsconfig.json
    echo -e "${GREEN}Updated path aliases in tsconfig.json${NC}"
  else
    echo -e "${GREEN}Path aliases already properly configured in tsconfig.json${NC}"
  fi
else
  echo -e "${RED}Error: tsconfig.json not found${NC}"
  exit 1
fi

# Instructions for the user
echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}Environment setup complete!${NC}"
echo -e "${BLUE}=====================================${NC}"
echo -e "${YELLOW}To start development:${NC}"
echo -e "1. In one terminal: ${GREEN}cd supabase && OPENAI_API_KEY=\"$OPENAI_API_KEY\" supabase functions serve dalle-image-gen --no-verify-jwt${NC}"
echo -e "2. In another terminal: ${GREEN}npm run dev -- --port 3000${NC}"
echo -e ""
echo -e "${YELLOW}Want to start everything at once?${NC}"
echo -e "Run: ${GREEN}npm run start${NC}"
echo -e "${BLUE}=====================================${NC}" 