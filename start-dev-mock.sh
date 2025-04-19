#!/bin/bash
echo "Starting KitchenBuddy in MOCK DEV MODE on port 8081..."
echo "This mode bypasses backend service requirements."
echo "Use this for frontend development when Supabase is unavailable."
echo ""
PORT=8081 npm run dev:mock 