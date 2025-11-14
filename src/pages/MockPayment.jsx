import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { confirmPayment, markPaymentFailed } from '../firebase/orders';
import { formatCurrency } from '../utils/helpers';
import { CheckCircle, XCircle, CreditCard, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const MockPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // Get order data from location state
    if (location.state?.orderId && location.state?.order) {
      setOrderData(location.state.order);
    } else {
      // If no order data, redirect back to cart
      toast.error('No order found. Please try again.');
      navigate('/cart');
    }
  }, [location, navigate]);

  const handlePaymentSuccess = async () => {
    if (!orderData || !location.state?.orderId) {
      toast.error('Order data missing');
      return;
    }

    setProcessing(true);
    try {
      console.log('Starting payment confirmation for order:', location.state.orderId);
      const result = await confirmPayment(location.state.orderId);
      console.log('Payment confirmation result:', result);
      
      if (result.success) {
        toast.success('Payment successful! Your order is being prepared.');
        // Small delay to ensure Firestore update is processed
        setTimeout(() => {
          // Redirect to order status page
          navigate(`/order-status/${location.state.orderId}`, {
            replace: true
          });
        }, 500);
      } else {
        console.error('Payment confirmation failed:', result.error);
        toast.error(`Payment confirmation failed: ${result.error || 'Unknown error'}`);
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(`An error occurred during payment: ${error.message}`);
      setProcessing(false);
    }
  };

  const handlePaymentFailure = async () => {
    if (!location.state?.orderId) {
      toast.error('Order ID missing');
      return;
    }

    setProcessing(true);
    try {
      const result = await markPaymentFailed(location.state.orderId);
      
      if (result.success) {
        toast.error('Payment failed. Please try again.');
        navigate('/cart');
      } else {
        toast.error('Failed to update order status');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment failure error:', error);
      toast.error('An error occurred');
      setProcessing(false);
    }
  };

  if (!orderData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Complete Your Payment
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Order #{location.state?.orderId?.slice(0, 8)}
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>
            <div className="space-y-3">
              {orderData.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-0"
                >
                  <div>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {item.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      × {item.quantity}
                    </span>
                  </div>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(orderData.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 mb-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <CreditCard className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Payment QR Code
              </h3>
              <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-8 mx-auto max-w-xs">
                <div className="aspect-square bg-white dark:bg-gray-500 rounded flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-300 text-sm">
                    QR Code Placeholder
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Scan this QR code to pay using UPI
              </p>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="space-y-4">
            <button
              onClick={handlePaymentSuccess}
              disabled={processing}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              {processing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Simulate Payment Success</span>
                </>
              )}
            </button>

            <button
              onClick={handlePaymentFailure}
              disabled={processing}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
              <span>Simulate Payment Failure</span>
            </button>
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              <strong>Note:</strong> This is a mock payment system. Click "Simulate Payment Success" 
              to complete your order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockPayment;

