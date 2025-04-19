# Meal-Minder-Guardian: Comprehensive Refactoring Plan

## Current Issues

Based on code review, the codebase has the following structural issues:

1. **Inconsistent Directory Structure**: The project has a nested `meal-minder-guardian` directory inside itself, causing confusion
2. **Mixed Paradigms**: Combination of React hooks, Vue components, and mixed state management approaches
3. **Duplicated Logic**: Multiple implementations for similar functionality
4. **Unclear Service Boundaries**: Service responsibilities overlap
5. **Scattered Configuration**: Environment variables and configuration are spread across multiple files
6. **Complex Hook Dependencies**: React hooks have deep dependency chains, making them hard to maintain
7. **Inefficient Error Handling**: Multiple error handling strategies without centralization

## Proposed Directory Structure

```
meal-minder-guardian/
├── .github/                  # GitHub workflows and templates
├── public/                   # Static assets
├── src/
│   ├── api/                  # API integration layer
│   │   ├── client.ts         # Base API client
│   │   ├── endpoints/        # API endpoint definitions
│   │   │   ├── dalle.ts
│   │   │   ├── recipes.ts
│   │   │   └── inventory.ts
│   │   └── models/           # API response/request models
│   ├── components/           # React components
│   │   ├── common/           # Reusable components
│   │   ├── layout/           # Layout components
│   │   ├── recipes/          # Recipe-related components
│   │   │   ├── card/         # Recipe card components
│   │   │   ├── details/      # Recipe details components
│   │   │   └── generation/   # Recipe generation components
│   │   ├── inventory/        # Inventory components
│   │   └── ui/               # UI primitives
│   ├── config/               # Application configuration
│   │   ├── constants.ts      # App constants
│   │   ├── environment.ts    # Environment configuration
│   │   └── routes.ts         # Route definitions
│   ├── contexts/             # React contexts
│   ├── hooks/                # React hooks
│   │   ├── api/              # API-related hooks
│   │   ├── recipes/          # Recipe-related hooks
│   │   ├── inventory/        # Inventory-related hooks
│   │   └── ui/               # UI-related hooks
│   ├── pages/                # Page components
│   ├── services/             # Business logic services
│   │   ├── image/            # Image-related services
│   │   ├── recipe/           # Recipe-related services
│   │   └── inventory/        # Inventory-related services
│   ├── store/                # State management
│   │   ├── slices/           # State slices
│   │   ├── actions/          # Action creators
│   │   └── index.ts          # Store configuration
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   ├── caching.ts
│   │   └── errors.ts
│   ├── App.tsx               # Main App component
│   └── index.tsx             # Entry point
├── supabase/                 # Supabase functions
│   ├── functions/
│   │   ├── dalle-image-gen/  # DALL-E image generation function
│   │   ├── recipe-gen/       # Recipe generation function
│   │   └── shared/           # Shared code between functions
│   └── migrations/           # Database migrations
├── scripts/                  # Build/development scripts
├── tests/                    # Test directory
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── e2e/                  # End-to-end tests
├── .env.example              # Example environment variables
├── package.json              # Dependencies
└── README.md                 # Documentation
```

## Key Refactoring Areas

### 1. API Layer Refactoring

**Issue**: The codebase directly calls Supabase functions and APIs without a centralized client.

**Solution**: Create a dedicated API layer with:

- Type-safe client for each service
- Consistent error handling
- Response caching
- Request/response typing
- Retries and circuit breaking

```typescript
// src/api/client.ts
export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers,
    };
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    // Implementation with error handling, retries, etc.
  }

  async post<T, D = any>(endpoint: string, data: D): Promise<T> {
    // Implementation with error handling, retries, etc.
  }
}
```

### 2. Service Layer Refactoring

**Issue**: Business logic is scattered across hooks, components and service files.

**Solution**: Create domain-specific services that encapsulate business logic:

```typescript
// src/services/recipe/recipeGenerationService.ts
export class RecipeGenerationService {
  private apiClient: ApiClient;
  private cacheService: CacheService;

  constructor(apiClient: ApiClient, cacheService: CacheService) {
    this.apiClient = apiClient;
    this.cacheService = cacheService;
  }

  async generateRecipes(ingredients: string[], count: number): Promise<Recipe[]> {
    // Business logic for recipe generation
  }
}
```

### 3. State Management Refactoring

**Issue**: Mix of React Context, custom hooks, and various state management approaches.

**Solution**: Standardize on a cohesive state management approach:

- Use React Context for global state (user, theme)
- Implement React Query for server state
- Adopt a structured approach (Redux/Zustand) for complex state

```typescript
// src/store/slices/recipeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe } from '@/types/recipe';

interface RecipeState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
}

const initialState: RecipeState = {
  recipes: [],
  loading: false,
  error: null,
};

export const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    // Reducers
  },
});
```

### 4. Hook Refactoring

**Issue**: Hooks have complex dependency chains and mixed responsibilities.

**Solution**: Create focused, single-responsibility hooks:

```typescript
// Before (complex hook with multiple responsibilities)
export const useRecipeGenerator = () => {
  // 200+ lines of mixed concern code
};

// After (simple, focused hooks)
export const useRecipeGeneration = () => {
  // Only handles recipe generation
};

export const useRecipeGenerationStatus = () => {
  // Only handles status tracking
};

export const useRecipeGenerationProgress = () => {
  // Only tracks progress
};
```

### 5. Component Refactoring

**Issue**: Components mix presentation, state and business logic.

**Solution**: Follow a pattern like Container/Presenter or adopt a layered approach:

```tsx
// Container component (connects to state/logic)
const RecipeGeneratorContainer: React.FC = () => {
  const { recipes, isLoading, error, generateRecipes } = useRecipeGeneration();

  return (
    <RecipeGenerator
      recipes={recipes}
      isLoading={isLoading}
      error={error}
      onGenerate={generateRecipes}
    />
  );
};

// Presenter component (pure rendering)
interface RecipeGeneratorProps {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
}

const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({
  recipes,
  isLoading,
  error,
  onGenerate,
}) => {
  // Pure component rendering
};
```

### 6. Error Handling Refactoring

**Issue**: Inconsistent error handling approaches across the codebase.

**Solution**: Create a centralized error handling system:

```typescript
// src/utils/errors.ts
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
  // Centralized error handling
};
```

### 7. Configuration Refactoring

**Issue**: Configuration scattered across files.

**Solution**: Centralize configuration:

```typescript
// src/config/environment.ts
export const environment = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:54321',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  // Other environment variables
};
```

## Implementation Strategy

1. **Phase 1: Project Structure**

   - Fix the nested directory structure
   - Establish the core directory organization
   - Move existing files to new locations

2. **Phase 2: API Layer**

   - Create API client infrastructure
   - Migrate service calls to use the new client
   - Implement common error handling

3. **Phase 3: Service Layer**

   - Extract business logic from hooks/components to services
   - Create domain-specific services
   - Establish clear service boundaries

4. **Phase 4: State Management**

   - Implement state management approach
   - Migrate from current approach
   - Add caching strategies

5. **Phase 5: Component Refactoring**

   - Separate container/presenter components
   - Improve component organization
   - Reduce component complexity

6. **Phase 6: Testing Infrastructure**
   - Set up testing infrastructure
   - Create test utilities
   - Implement critical tests

## Benefits

This refactoring will yield:

1. **Better Maintainability**: Clear separation of concerns
2. **Improved Developer Experience**: Easier to navigate and understand code
3. **Better Performance**: Optimized caching and state management
4. **Reduced Bugs**: Centralized error handling and type safety
5. **Better Testability**: Smaller, focused units for testing
6. **Faster Onboarding**: Clearer code organization for new developers

## Measuring Success

The refactoring will be considered successful if:

1. **Code Quality Metrics Improve**: Measured by static analysis tools
2. **Build Time Decreases**: Due to better code organization
3. **Developer Productivity Increases**: Measured by time to implement features
4. **Bug Count Decreases**: Fewer bugs reported in refactored areas
5. **Performance Improves**: Faster rendering and response times
