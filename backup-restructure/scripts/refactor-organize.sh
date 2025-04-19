#!/bin/bash

# Meal-Minder-Guardian Refactoring Script
# ======================================
# This script implements Phase 1 of the refactoring plan:
# - Fixes the nested directory structure
# - Establishes the core directory organization
# - Moves existing files to their new locations

set -e  # Exit on any error

# Create directories if they don't exist
mkdir -p src/api/endpoints src/api/models
mkdir -p src/components/common src/components/layout src/components/recipes/card src/components/recipes/details src/components/recipes/generation
mkdir -p src/config
mkdir -p src/contexts
mkdir -p src/hooks/api src/hooks/recipes src/hooks/inventory src/hooks/ui
mkdir -p src/services/image src/services/recipe src/services/inventory
mkdir -p src/store/slices src/store/actions
mkdir -p src/utils
mkdir -p tests/unit tests/integration tests/e2e
mkdir -p supabase/functions/shared

# First, resolve any nested directory issues
if [ -d "meal-minder-guardian/meal-minder-guardian" ]; then
  echo "Resolving nested directory structure..."
  
  # Copy all files from the nested directory to the parent
  cp -R meal-minder-guardian/meal-minder-guardian/* meal-minder-guardian/
  
  # Remove the nested directory
  rm -rf meal-minder-guardian/meal-minder-guardian
  
  echo "Nested directory structure resolved."
fi

# Create config directory and move configuration files
echo "Setting up configuration files..."
touch src/config/constants.ts
touch src/config/environment.ts
touch src/config/routes.ts

# Move API-related files
echo "Organizing API layer..."
if [ -f "src/services/dalleService.ts" ]; then
  cp src/services/dalleService.ts src/api/endpoints/dalle.ts
fi

# Organize context files
echo "Organizing context files..."
mkdir -p src/contexts
if [ -d "src/context" ]; then
  cp src/context/* src/contexts/
fi

# Organize components
echo "Organizing components..."
if [ -d "src/components/recipes" ]; then
  # Move recipe card components
  mkdir -p src/components/recipes/card
  for file in src/components/recipes/*Card*.tsx; do
    if [ -f "$file" ]; then
      cp "$file" src/components/recipes/card/
    fi
  done
  
  # Move recipe detail components
  mkdir -p src/components/recipes/details
  if [ -d "src/components/recipes/details" ]; then
    cp src/components/recipes/details/* src/components/recipes/details/
  fi
  
  # Move recipe generation components
  mkdir -p src/components/recipes/generation
  for file in src/components/recipes/*Generator*.tsx src/components/recipes/*Generation*.tsx; do
    if [ -f "$file" ]; then
      cp "$file" src/components/recipes/generation/
    fi
  done
fi

# Organize hooks
echo "Organizing hooks..."
if [ -d "src/hooks/recipe-generation" ]; then
  mkdir -p src/hooks/recipes/generation
  cp src/hooks/recipe-generation/* src/hooks/recipes/generation/
fi

if [ -d "src/hooks/recipe" ]; then
  mkdir -p src/hooks/recipes
  cp src/hooks/recipe/* src/hooks/recipes/
fi

if [ -d "src/hooks/inventory" ]; then
  cp src/hooks/inventory/* src/hooks/inventory/
fi

if [ -d "src/hooks/image" ]; then
  mkdir -p src/hooks/ui/image
  cp src/hooks/image/* src/hooks/ui/image/
fi

# Organize services
echo "Organizing services..."
if [ -f "src/services/dalleService.ts" ]; then
  mkdir -p src/services/image
  cp src/services/dalleService.ts src/services/image/dalleService.ts
fi

if [ -d "src/services/generation" ]; then
  mkdir -p src/services/recipe
  cp src/services/generation/* src/services/recipe/
fi

if [ -d "src/services/image" ]; then
  cp src/services/image/* src/services/image/
fi

# Create initial API client
echo "Creating API client..."
cat > src/api/client.ts << 'EOF'
/**
 * API Client for all external API requests
 */
export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers
    };
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.headers
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${await response.text()}`);
    }
    
    return response.json();
  }

  async post<T, D = any>(endpoint: string, data: D): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${await response.text()}`);
    }
    
    return response.json();
  }
}
EOF

# Create centralized environment config
echo "Creating environment config..."
cat > src/config/environment.ts << 'EOF'
/**
 * Centralized environment configuration
 */
export const environment = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:54321',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
};
EOF

# Create centralized error handling
echo "Creating error utils..."
cat > src/utils/errors.ts << 'EOF'
/**
 * Centralized error handling utilities
 */
export class AppError extends Error {
  public code: string;
  public isOperational: boolean;

  constructor(message: string, code: string, isOperational = true) {
    super(message);
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', false);
  }
  
  return new AppError(String(error), 'UNKNOWN_ERROR', false);
};
EOF

# Create unified caching strategy
echo "Creating cache utils..."
cat > src/utils/caching.ts << 'EOF'
/**
 * Unified caching utilities
 */
export class CacheService {
  private prefix: string;
  
  constructor(prefix: string) {
    this.prefix = prefix;
  }
  
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.prefix}:${key}`);
      if (!item) return null;
      return JSON.parse(item);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  setItem<T>(key: string, value: T, ttl?: number): void {
    try {
      const item = {
        value,
        expiry: ttl ? Date.now() + ttl : null,
      };
      localStorage.setItem(`${this.prefix}:${key}`, JSON.stringify(item));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  removeItem(key: string): void {
    try {
      localStorage.removeItem(`${this.prefix}:${key}`);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }
  
  clear(): void {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.prefix}:`)) {
          keys.push(key);
        }
      }
      
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

// Create specialized cache instances
export const imageCache = new CacheService('image');
export const recipeCache = new CacheService('recipe');
export const apiCache = new CacheService('api');
EOF

echo "Refactoring script completed." 