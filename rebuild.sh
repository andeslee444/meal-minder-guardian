#!/bin/bash

echo "Stopping all Vite and Node processes..."
pkill -f vite || true
pkill -f node || true

echo "Cleaning caches..."
rm -rf node_modules/.vite node_modules/.cache .cache

echo "Fixing RecipeCard issue by replacing with SimpleRecipeCard..."
if [ -f src/components/recipes/RecipeCard.tsx.bak ]; then
  echo "Backup file exists, not overwriting existing backup."
else
  mv src/components/recipes/RecipeCard.tsx src/components/recipes/RecipeCard.tsx.bak
fi

cp src/components/recipes/SimpleRecipeCard.tsx src/components/recipes/RecipeCard.tsx

echo "Starting debug server..."
npx vite --force --config vite.config.js --debug

echo "Debug server started. Open http://localhost:5173/debug-entry.html in your browser" 