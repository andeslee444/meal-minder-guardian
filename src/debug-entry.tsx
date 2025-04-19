import React from 'react';
import ReactDOM from 'react-dom/client';
import DebugComponent from './debug-page';

console.log('Debug entry point loaded');

const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('Root element found, rendering debug component');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <DebugComponent />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found!');
  document.body.innerHTML = '<div id="error">Root element not found!</div>';
}
