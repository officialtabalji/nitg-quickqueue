import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { setupForegroundMessageListener } from './utils/notifications';

// Suppress Razorpay COOP warnings (known issue with Razorpay SDK)
const originalError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || '';
  // Filter out Razorpay COOP warnings
  if (
    message.includes('Cross-Origin-Opener-Policy') ||
    message.includes('window.closed') ||
    message.includes('window.close')
  ) {
    return; // Suppress these warnings
  }
  originalError.apply(console, args);
};

// Setup foreground message listener for push notifications
// This handles notifications when the app is in the foreground
// Wrap in try-catch to prevent errors from breaking the app
try {
  setupForegroundMessageListener((payload) => {
    console.log('Foreground notification received:', payload);
    // Additional custom handling can be added here
    // For example, navigate to order status page if orderId is present
    if (payload.data?.orderId) {
      // Could navigate to order status page
      // window.location.href = `/order-status/${payload.data.orderId}`;
    }
  });
} catch (error) {
  console.warn('Error setting up notification listener:', error);
  // Don't break the app if notifications fail
}

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#14b8a6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer' }}>Error Details</summary>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '5px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Check if root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found! Make sure index.html has <div id="root"></div>');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error: Root element not found</h1><p>Please check your index.html file.</p></div>';
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Error rendering app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: system-ui, sans-serif;">
        <h1>Failed to load application</h1>
        <p style="color: #666;">${error.message}</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #14b8a6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
          Reload Page
        </button>
        <details style="margin-top: 20px; text-align: left;">
          <summary style="cursor: pointer;">Error Details</summary>
          <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; font-size: 12px;">${error.stack}</pre>
        </details>
      </div>
    `;
  }
}

