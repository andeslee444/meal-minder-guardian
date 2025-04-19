import React from 'react';
import ReactDOM from 'react-dom/client';

// Super simple component with no dependencies
const DebugComponent = () => {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
      }}
    >
      <h1 style={{ color: '#0070f3' }}>KitchenBuddy Debug Page</h1>
      <p>If you can see this page, basic React rendering is working correctly.</p>

      <div
        style={{
          border: '1px solid #ccc',
          padding: '20px',
          borderRadius: '5px',
          marginTop: '20px',
        }}
      >
        <h2>Test Card</h2>
        <p>This is a static test card with no external dependencies.</p>
        <div style={{ display: 'flex', marginTop: '10px' }}>
          <button
            style={{
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
};

// Only run this if we're directly loading this file
if (import.meta.url.includes('debug-page')) {
  const container = document.getElementById('root');
  if (container) {
    ReactDOM.createRoot(container).render(<DebugComponent />);
  }
}

export default DebugComponent;
