# Meal Minder Guardian

A smart meal planning app that uses AI to generate recipes based on the ingredients you have available. Get personalized recipe suggestions complete with images, instructions, and ingredient lists.

## Features

- **Recipe Generation**: Generate custom recipes based on your available ingredients
- **AI-Powered Images**: Each recipe comes with a unique AI-generated image
- **Smart Caching**: Optimized performance with intelligent caching
- **Responsive Design**: Works on desktop and mobile devices
- **Offline Support**: Cached recipes available even without internet connection

## Tech Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase for serverless functions and authentication
- **APIs**: DALL-E for image generation, Spoonacular for recipe data
- **State Management**: React Hooks with Context API
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

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```
   cp .env.example .env
   ```

4. Add your API keys to the `.env` file:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_SPOONACULAR_API_KEY=your_spoonacular_api_key_here
   ```

### Development

1. Run the setup script to initialize the development environment:

   ```
   npm run setup
   ```

2. Start the development server:

   ```
   npm run start
   ```

3. Open your browser to http://localhost:3000

## API Integration

### DALL-E (OpenAI)

The application uses DALL-E to generate custom images for each recipe. The image generation is handled by a Supabase Edge Function that proxies requests to the OpenAI API, providing security and caching.

### Spoonacular

Recipe data is sourced from the Spoonacular API, which provides comprehensive recipe information, including ingredients, instructions, and nutritional data.

## Error Handling

The application uses a robust error handling system that provides:

- Standardized error types
- Detailed error logging
- Graceful fallbacks for API failures
- User-friendly error messages

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
