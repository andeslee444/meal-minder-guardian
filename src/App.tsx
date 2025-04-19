import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useUserContext } from '@/context/AppContext';
import Index from './pages/Index';
import Inventory from './pages/Inventory';
import Recipes from './pages/Recipes';
import Expenses from './pages/Expenses';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import StatusIndicator from './components/ui/status';
import { RecipeGenerationTest } from '@/components/test/RecipeGenerationTest';
import DalleTest from './pages/test/DalleTest';
import { useEffect, useState } from 'react';
import { testSupabaseConnection } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading, hasConnectionError } = useUserContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kitchen-500"></div>
      </div>
    );
  }

  // If we have a connection error but we're in development mode,
  // allow access with a warning banner
  if (hasConnectionError && import.meta.env.DEV) {
    return (
      <>
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 fixed top-0 left-0 right-0 z-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                Development Mode: Protected route accessible despite authentication errors.
              </p>
            </div>
          </div>
        </div>
        <div className="pt-14">{children}</div>
      </>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <Recipes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Test routes - only available in development */}
        {import.meta.env.DEV && (
          <>
            <Route path="/test/recipe-generation" element={<RecipeGenerationTest />} />
            <Route path="/test/dalle" element={<DalleTest />} />
          </>
        )}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

function ConnectionWarningBanner({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-amber-700">
            Warning: We couldn't connect to the backend services. Some features may not work
            correctly.
          </p>
        </div>
        <button onClick={onClose} className="flex-shrink-0 ml-auto">
          <X className="h-5 w-5 text-amber-400" />
        </button>
      </div>
    </div>
  );
}

function App() {
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showConnectionWarning, setShowConnectionWarning] = useState<boolean>(false);

  useEffect(() => {
    // Clear caches on app load
    console.log('Clearing image caches...');
    const cacheKeys = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('image-cache') || key.includes('dalle-cache'))) {
        cacheKeys.push(key);
      }
    }

    if (cacheKeys.length > 0) {
      console.log(`Found ${cacheKeys.length} cache entries to clear`);
      cacheKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    }

    // Test Supabase connection on app load, but don't block rendering
    const connectionCheckTimer = setTimeout(() => {
      // If connection check takes too long, continue loading the app
      setIsLoading(false);
    }, 2000); // Wait max 2 seconds

    testSupabaseConnection()
      .then(result => {
        clearTimeout(connectionCheckTimer);
        if (!result.success) {
          console.warn('Supabase connection failed, continuing with limited functionality');
          setConnectionError(true);
          setShowConnectionWarning(true);
        }
        setIsLoading(false);
      })
      .catch(() => {
        clearTimeout(connectionCheckTimer);
        setConnectionError(true);
        setShowConnectionWarning(true);
        setIsLoading(false);
      });
  }, []);

  // Show simple loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kitchen-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showConnectionWarning && (
        <ConnectionWarningBanner onClose={() => setShowConnectionWarning(false)} />
      )}

      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </TooltipProvider>
          </AppProvider>
        </BrowserRouter>
      </QueryClientProvider>

      <StatusIndicator />
    </div>
  );
}

export default App;
