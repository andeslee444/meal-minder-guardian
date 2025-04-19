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
import { useEffect } from 'react';
import dalleService from '@/services/dalleService';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useUserContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kitchen-500"></div>
      </div>
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
        <Route path="/test/recipe-generation" element={<RecipeGenerationTest />} />
        <Route path="/test/dalle" element={<DalleTest />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

function App() {
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

    console.log(`Found ${cacheKeys.length} cache entries to clear`);
    cacheKeys.forEach(key => {
      console.log(`Removing cache: ${key}`);
      localStorage.removeItem(key);
    });

    // Test DALL-E service
    console.log('Testing DALL-E service...');
    dalleService
      .testDalleService()
      .then(url => {
        console.log('DALL-E test result:', url ? 'Success' : 'Failed');
        console.log('Image URL preview:', url?.substring(0, 50));
      })
      .catch(err => console.error('DALL-E test error:', err));
  }, []);

  return (
    <div className="min-h-screen bg-background">
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
