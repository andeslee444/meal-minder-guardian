import './debug-env';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initErrorTracking } from './lib/error-tracking';

// Try-catch block for the entire initialization process
try {
  console.log('Starting application initialization');

  // Initialize error tracking (Sentry) in production
  initErrorTracking();

  // Find the root element
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    // Create the root element if it doesn't exist
    console.warn('Root element not found, creating one');
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);

    // Use the newly created root
    renderApp(newRoot);
  } else {
    // Use the existing root
    renderApp(rootElement);
  }
} catch (error) {
  console.error('Fatal error during app initialization:', error);

  // Create a fallback error UI
  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
      <h1 style="color: #e11d48;">Application Error</h1>
      <p>The application failed to initialize. Please try reloading the page.</p>
      <div style="background-color: #f9f9f9; padding: 10px; border-radius: 4px; margin-top: 20px; max-width: 80%;">
        <pre style="overflow: auto; max-height: 200px;">${error?.toString() || 'Unknown error'}</pre>
      </div>
      <button 
        onclick="window.location.reload()" 
        style="margin-top: 20px; padding: 10px 20px; background-color: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Reload Page
      </button>
    </div>
  `;
}

// Function to render the app
function renderApp(rootElement: HTMLElement) {
  // Suppress React Router warnings in production
  if (process.env.NODE_ENV === 'production') {
    // Replace console.warn to filter out React Router warnings
    const originalWarn = console.warn;
    console.warn = (...args) => {
      // Filter out React Router warnings
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('React Router') || args[0].includes('react-router'))
      ) {
        return;
      }
      originalWarn(...args);
    };
  }

  // Render the app wrapped in an ErrorBoundary
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  console.log('Application successfully rendered');
}
