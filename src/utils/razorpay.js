// Razorpay integration
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = async (amount, orderId, userData) => {
  // In production, this should call your backend API to create a Razorpay order
  // For now, we'll use test keys directly (not recommended for production)
  
  return new Promise((resolve) => {
    let resolved = false;
    
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Replace with your test key
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'NITG QuickQueue',
      description: `Order #${orderId}`,
      order_id: null, // This should come from your backend
      handler: function (response) {
        // This handler is called when payment succeeds
        if (!resolved) {
          resolved = true;
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature
          });
        }
      },
      prefill: {
        name: userData?.name || '',
        email: userData?.email || '',
        contact: userData?.phone || ''
      },
      theme: {
        color: '#14b8a6'
      },
      modal: {
        ondismiss: function() {
          // Called when user closes the payment modal
          if (!resolved) {
            resolved = true;
            resolve({
              success: false,
              error: 'Payment cancelled by user'
            });
          }
        }
      }
    };

    try {
      const razorpay = new window.Razorpay(options);
      
      // Additional event listeners as backup (though handler should work)
      razorpay.on('payment.success', (response) => {
        // Backup handler in case main handler doesn't fire
        if (!resolved) {
          resolved = true;
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature
          });
        }
      });
      
      razorpay.on('payment.failed', (response) => {
        // Backup handler for failed payments
        if (!resolved) {
          resolved = true;
          resolve({
            success: false,
            error: response.error?.description || 'Payment failed'
          });
        }
      });
      
      razorpay.open();
      
      // Timeout fallback - if payment modal is open too long without response
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve({
            success: false,
            error: 'Payment timeout. Please try again.'
          });
        }
      }, 300000); // 5 minutes timeout
      
    } catch (error) {
      if (!resolved) {
        resolved = true;
        resolve({
          success: false,
          error: error.message || 'Failed to initialize payment'
        });
      }
    }
  });
};

// Simplified payment handler for testing
export const processPayment = async (amount, orderId, userData) => {
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    return { success: false, error: 'Failed to load Razorpay script' };
  }

  try {
    const result = await createRazorpayOrder(amount, orderId, userData);
    return result;
  } catch (error) {
    return { success: false, error: error.message || 'Payment failed' };
  }
};

