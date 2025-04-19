# Meal Minder Guardian

A smart meal planning app that uses AI to generate recipes based on the ingredients you have available. Get personalized recipe suggestions complete with images, instructions, and ingredient lists.

## Features

- **Recipe Generation**: Generate custom recipes based on your available ingredients
- **AI-Powered Images**: Each recipe comes with a unique AI-generated image
- **Smart Caching**: Optimized performance with intelligent caching
- **Responsive Design**: Works on desktop and mobile devices
- **Offline Support**: Cached recipes available even without internet connection
- **Secure**: Built with robust security features including Row Level Security
- **Validated Forms**: Client and server-side validation for data integrity

## Tech Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase for serverless functions, authentication, and database
- **APIs**: DALL-E for image generation, Spoonacular for recipe data
- **State Management**: React Hooks with Context API and React Query
- **Validation**: Zod for schema validation
- **Testing**: Jest for unit and integration tests
- **Error Tracking**: Sentry for real-time error monitoring
- **CI/CD**: GitHub Actions for continuous integration and deployment
- **Deployment**: Supabase hosting

## Project Structure

The project follows a clean architecture pattern with clear separation of concerns:

```
meal-minder-guardian/
├── public/
├── scripts/
│   ├── setup-dev-environment.sh     # Setup development environment
│   └── start-dev.sh                 # Start development server
├── src/
│   ├── api/                         # API clients and endpoints
│   │   ├── client.ts                # Base API client
│   │   └── endpoints/               # API endpoints
│   ├── components/                  # UI components
│   │   ├── common/                  # Shared components
│   │   ├── recipes/                 # Recipe-related components
│   │   └── ui/                      # UI primitives
│   ├── config/                      # Application configuration
│   │   ├── constants.ts             # App constants
│   │   └── environment.ts           # Environment configuration
│   ├── contexts/                    # React contexts
│   ├── hooks/                       # Custom React hooks
│   │   ├── api/                     # API-related hooks
│   │   └── ui/                      # UI-related hooks
│   ├── lib/                         # Utility libraries
│   ├── types/                       # TypeScript type definitions
│   └── utils/                       # Utility functions
│       ├── caching.ts               # Caching utilities
│       └── errors.ts                # Error handling utilities
├── supabase/                        # Supabase configuration
│   └── functions/                   # Supabase Edge Functions
│       └── dalle-image-gen/         # DALL-E image generation function
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase CLI
- OpenAI API key
- Spoonacular API key (optional)

### Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/meal-minder-guardian.git
   cd meal-minder-guardian
   ```

## API Integration

### DALL-E (OpenAI)

The application uses DALL-E to generate custom images for each recipe. The image generation is handled by a Supabase Edge Function that proxies requests to the OpenAI API, providing security and caching.

### Spoonacular

Recipe data is sourced from the Spoonacular API, which provides comprehensive recipe information, including ingredients, instructions, and nutritional data.

## Security

The application includes several security features:

- **Row Level Security (RLS)**: Fine-grained access control at the database level ensures users can only access and modify their own data
- **Input Validation**: All user inputs are validated both client-side (with Zod) and server-side
- **Environment Variables**: Sensitive API keys and configuration are stored as environment variables
- **Error Boundaries**: React error boundaries prevent application crashes due to component errors

### Row Level Security Policies

The following RLS policies are implemented:

- **Inventory Items**: Users can only view, create, update, and delete their own inventory items
- **User Profiles**: Users can only view and update their own profile
- **Recipes**: All users can view recipes, but only create/edit/delete their own
- **Recipe Comments**: All users can view comments, but only edit and delete their own
- **Recipe Favorites**: All users can view favorites, but only create and delete their own

## Testing

The application uses Jest for testing:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Testing Strategy

- **Unit Tests**: Focus on utility functions, hooks, and pure components
- **Integration Tests**: Test interactions between components and hooks
- **Validation Tests**: Ensure form validation works as expected
- **API Mocking**: Mock API calls to test error handling and loading states

## Error Handling

The application uses a robust error handling system that provides:

- **Standardized Error Types**: Consistent error types across the application
- **Error Tracking**: Integration with Sentry for real-time error monitoring
- **Error Boundaries**: Prevent app crashes due to component errors
- **Detailed Error Logging**: Comprehensive error logs for debugging
- **Graceful Fallbacks**: User-friendly fallbacks for API failures
- **User-Friendly Messages**: Clear error messages for users

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

- **Linting**: Ensures code quality and consistency
- **Testing**: Runs unit and integration tests
- **Building**: Verifies the application builds successfully
- **Deployment**: Automates deployment to production (when configured)

To view the workflow configuration, see `.github/workflows/ci.yml`.

## Caching Strategy

To optimize performance and reduce API calls, the application implements a multi-level caching strategy:

- In-memory cache for session data
- LocalStorage cache for persistent data
- TTL (Time-to-Live) support for cache expiration
- Automatic cache pruning for expired items

## Deployment

### Supabase Setup

1. Create a Supabase project
2. Initialize Supabase in your project:

   ```
   supabase init
   ```

3. Link to your Supabase project:

   ```
   supabase link --project-ref your-project-ref
   ```

4. Deploy the Edge Functions:
   ```
   supabase functions deploy dalle-image-gen
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenAI](https://openai.com/) for the DALL-E API
- [Spoonacular](https://spoonacular.com/) for the recipe API
- [Supabase](https://supabase.io/) for the serverless infrastructure
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling
