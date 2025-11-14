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
setupForegroundMessageListener((payload) => {
  console.log('Foreground notification received:', payload);
  // Additional custom handling can be added here
  // For example, navigate to order status page if orderId is present
  if (payload.data?.orderId) {
    // Could navigate to order status page
    // window.location.href = `/order-status/${payload.data.orderId}`;
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

