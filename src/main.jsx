import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

