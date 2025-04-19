import './debug-env';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

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

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
