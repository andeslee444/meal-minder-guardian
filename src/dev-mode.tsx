/**
 * Development Mode Entry Point
 *
 * This file provides an alternative entry point for development that bypasses
 * backend service checks and authentication requirements.
 *
 * Use this when working on frontend components without needing the backend.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import './index.css';

// Import all pages
import Index from './pages/Index';
import Inventory from './pages/Inventory';
import Recipes from './pages/Recipes';
import Expenses from './pages/Expenses';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import { RecipeGenerationTest } from '@/components/test/RecipeGenerationTest';
import DalleTest from './pages/test/DalleTest';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const DevBanner = () => (
  <div className="bg-amber-100 border-l-4 border-amber-500 p-4 fixed top-0 left-0 right-0 z-50">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-amber-700">
          <strong>Development Mode:</strong> Running with mocked backend services. No authentication
          required.
        </p>
      </div>
    </div>
  </div>
);

// Simple mock of the app without backend checks
function DevApp() {
  return (
    <div className="min-h-screen bg-background">
      <DevBanner />

      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <div className="pt-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/test/recipe-generation" element={<RecipeGenerationTest />} />
                <Route path="/test/dalle" element={<DalleTest />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>

            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

// Find root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Render the app
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <DevApp />
  </React.StrictMode>
);
